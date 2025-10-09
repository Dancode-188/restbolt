import { db } from './db';
import { Chain, ChainStep, ChainExecution, Request, Response } from '@/types';
import { variableExtractionService } from './variable-extraction-service';
import { httpClient } from './http-client';

class ChainService {
  /**
   * Create a new chain
   */
  async createChain(name: string, description?: string): Promise<Chain> {
    const chain: Chain = {
      id: `chain-${Date.now()}`,
      name,
      description,
      steps: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await db.chains.add(chain);
    return chain;
  }

  /**
   * Get all chains
   */
  async getAllChains(): Promise<Chain[]> {
    return await db.chains.toArray();
  }

  /**
   * Get chain by ID
   */
  async getChain(id: string): Promise<Chain | undefined> {
    return await db.chains.get(id);
  }

  /**
   * Update chain
   */
  async updateChain(id: string, updates: Partial<Chain>): Promise<void> {
    await db.chains.update(id, {
      ...updates,
      updatedAt: new Date(),
    });
  }

  /**
   * Delete chain
   */
  async deleteChain(id: string): Promise<void> {
    await db.chains.delete(id);
    // Also delete related executions
    await db.chainExecutions.where('chainId').equals(id).delete();
  }

  /**
   * Add step to chain
   */
  async addStep(chainId: string, step: Omit<ChainStep, 'id' | 'order'>): Promise<void> {
    const chain = await this.getChain(chainId);
    if (!chain) throw new Error('Chain not found');

    const newStep: ChainStep = {
      ...step,
      id: `step-${Date.now()}`,
      order: chain.steps.length,
    };

    chain.steps.push(newStep);
    await this.updateChain(chainId, { steps: chain.steps });
  }

  /**
   * Update step in chain
   */
  async updateStep(chainId: string, stepId: string, updates: Partial<ChainStep>): Promise<void> {
    const chain = await this.getChain(chainId);
    if (!chain) throw new Error('Chain not found');

    chain.steps = chain.steps.map(step =>
      step.id === stepId ? { ...step, ...updates } : step
    );

    await this.updateChain(chainId, { steps: chain.steps });
  }

  /**
   * Remove step from chain
   */
  async removeStep(chainId: string, stepId: string): Promise<void> {
    const chain = await this.getChain(chainId);
    if (!chain) throw new Error('Chain not found');

    chain.steps = chain.steps
      .filter(step => step.id !== stepId)
      .map((step, index) => ({ ...step, order: index })); // Reorder

    await this.updateChain(chainId, { steps: chain.steps });
  }

  /**
   * Reorder steps in chain
   */
  async reorderSteps(chainId: string, stepIds: string[]): Promise<void> {
    const chain = await this.getChain(chainId);
    if (!chain) throw new Error('Chain not found');

    const reorderedSteps = stepIds.map((id, index) => {
      const step = chain.steps.find(s => s.id === id);
      if (!step) throw new Error(`Step ${id} not found`);
      return { ...step, order: index };
    });

    await this.updateChain(chainId, { steps: reorderedSteps });
  }

  /**
   * Execute a chain
   */
  async executeChain(
    chainId: string,
    onStepComplete?: (stepIndex: number, response: Response, variables: Record<string, any>) => void,
    onStepError?: (stepIndex: number, error: string) => void
  ): Promise<ChainExecution> {
    const chain = await this.getChain(chainId);
    if (!chain) throw new Error('Chain not found');

    const execution: ChainExecution = {
      id: `execution-${Date.now()}`,
      chainId,
      startedAt: new Date(),
      status: 'running',
      steps: chain.steps.map(step => ({
        stepId: step.id,
        order: step.order,
        status: 'pending',
      })),
      variables: {},
    };

    // Save initial execution state
    await db.chainExecutions.add(execution);

    try {
      // Execute steps sequentially
      for (let i = 0; i < chain.steps.length; i++) {
        const step = chain.steps[i];
        
        // Update step status to running
        execution.steps[i].status = 'running';
        execution.steps[i].startedAt = new Date();
        await db.chainExecutions.update(execution.id, { steps: execution.steps });

        try {
          // Wait for delay if specified
          if (step.delay && step.delay > 0) {
            await new Promise(resolve => setTimeout(resolve, step.delay));
          }

          // Get request (either from reference or inline)
          let request: Request;
          if (step.requestId) {
            // Load from collections
            const collections = await db.collections.toArray();
            let foundRequest: Request | undefined;
            
            for (const collection of collections) {
              foundRequest = collection.requests.find(r => r.id === step.requestId);
              if (foundRequest) break;
            }

            if (!foundRequest) {
              throw new Error(`Request ${step.requestId} not found`);
            }
            request = foundRequest;
          } else if (step.request) {
            request = step.request;
          } else {
            throw new Error('Step has no request defined');
          }

          // Interpolate variables in request
          const interpolatedRequest = this.interpolateRequest(request, execution.variables);
          execution.steps[i].request = interpolatedRequest;

          // Execute request
          const response = await httpClient.sendRequest(interpolatedRequest);
          execution.steps[i].response = response;
          execution.steps[i].status = 'success';
          execution.steps[i].completedAt = new Date();

          // Extract variables if defined
          if (step.variableExtractions.length > 0 && response.data) {
            const extractedVars = variableExtractionService.extractVariables(
              response.data,
              step.variableExtractions
            );
            execution.steps[i].extractedVariables = extractedVars;
            
            // Merge into execution context
            execution.variables = {
              ...execution.variables,
              ...extractedVars,
            };
          }

          // Update execution
          await db.chainExecutions.update(execution.id, { 
            steps: execution.steps,
            variables: execution.variables,
          });

          // Callback
          if (onStepComplete) {
            onStepComplete(i, response, execution.variables);
          }

        } catch (error: any) {
          execution.steps[i].status = 'failed';
          execution.steps[i].error = error.message;
          execution.steps[i].completedAt = new Date();

          await db.chainExecutions.update(execution.id, { steps: execution.steps });

          // Callback
          if (onStepError) {
            onStepError(i, error.message);
          }

          // Check if we should continue on error
          if (!step.continueOnError) {
            throw new Error(`Step ${i + 1} failed: ${error.message}`);
          }

          // Mark remaining steps as skipped
          for (let j = i + 1; j < execution.steps.length; j++) {
            execution.steps[j].status = 'skipped';
          }
          break;
        }
      }

      // Mark execution as completed
      execution.status = 'completed';
      execution.completedAt = new Date();
      await db.chainExecutions.update(execution.id, {
        status: execution.status,
        completedAt: execution.completedAt,
      });

    } catch (error: any) {
      execution.status = 'failed';
      execution.error = error.message;
      execution.completedAt = new Date();
      await db.chainExecutions.update(execution.id, {
        status: execution.status,
        error: execution.error,
        completedAt: execution.completedAt,
      });
    }

    return execution;
  }

  /**
   * Interpolate variables in request
   */
  private interpolateRequest(request: Request, variables: Record<string, any>): Request {
    return {
      ...request,
      url: variableExtractionService.interpolateVariables(request.url, variables),
      headers: Object.fromEntries(
        Object.entries(request.headers).map(([key, value]) => [
          key,
          variableExtractionService.interpolateVariables(value, variables),
        ])
      ),
      params: Object.fromEntries(
        Object.entries(request.params).map(([key, value]) => [
          key,
          variableExtractionService.interpolateVariables(value, variables),
        ])
      ),
      body: request.body
        ? variableExtractionService.interpolateVariables(request.body, variables)
        : undefined,
    };
  }

  /**
   * Get execution history for a chain
   */
  async getChainExecutions(chainId: string): Promise<ChainExecution[]> {
    return await db.chainExecutions.where('chainId').equals(chainId).toArray();
  }

  /**
   * Get specific execution
   */
  async getExecution(executionId: string): Promise<ChainExecution | undefined> {
    return await db.chainExecutions.get(executionId);
  }

  /**
   * Cancel running execution (best effort)
   */
  async cancelExecution(executionId: string): Promise<void> {
    const execution = await this.getExecution(executionId);
    if (!execution || execution.status !== 'running') return;

    execution.status = 'cancelled';
    execution.completedAt = new Date();
    
    // Mark running/pending steps as skipped
    execution.steps = execution.steps.map(step => ({
      ...step,
      status: step.status === 'running' || step.status === 'pending' ? 'skipped' : step.status,
    }));

    await db.chainExecutions.update(executionId, {
      status: execution.status,
      completedAt: execution.completedAt,
      steps: execution.steps,
    });
  }

  /**
   * Delete execution
   */
  async deleteExecution(executionId: string): Promise<void> {
    await db.chainExecutions.delete(executionId);
  }

  /**
   * Clear all executions for a chain
   */
  async clearChainExecutions(chainId: string): Promise<void> {
    await db.chainExecutions.where('chainId').equals(chainId).delete();
  }

  /**
   * Duplicate a chain
   */
  async duplicateChain(chainId: string): Promise<Chain> {
    const original = await this.getChain(chainId);
    if (!original) throw new Error('Chain not found');

    const duplicate: Chain = {
      ...original,
      id: `chain-${Date.now()}`,
      name: `${original.name} (Copy)`,
      createdAt: new Date(),
      updatedAt: new Date(),
      steps: original.steps.map(step => ({
        ...step,
        id: `step-${Date.now()}-${step.order}`,
      })),
    };

    await db.chains.add(duplicate);
    return duplicate;
  }

  /**
   * Export chain as JSON
   */
  async exportChain(chainId: string): Promise<string> {
    const chain = await this.getChain(chainId);
    if (!chain) throw new Error('Chain not found');
    return JSON.stringify(chain, null, 2);
  }

  /**
   * Import chain from JSON
   */
  async importChain(json: string): Promise<Chain> {
    const chain = JSON.parse(json) as Chain;
    
    // Generate new IDs
    chain.id = `chain-${Date.now()}`;
    chain.createdAt = new Date();
    chain.updatedAt = new Date();
    chain.steps = chain.steps.map((step, index) => ({
      ...step,
      id: `step-${Date.now()}-${index}`,
    }));

    await db.chains.add(chain);
    return chain;
  }
}

export const chainService = new ChainService();
