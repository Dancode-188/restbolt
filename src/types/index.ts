export interface Request {
  id: string;
  name: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD' | 'OPTIONS';
  url: string;
  headers: Record<string, string>;
  params: Record<string, string>;
  body?: string;
  postScript?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Response {
  status: number;
  statusText: string;
  headers: Record<string, string>;
  data: any;
  time: number; // milliseconds
  size: number; // bytes
}

export interface Collection {
  id: string;
  name: string;
  requests: Request[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Environment {
  id: string;
  name: string;
  variables: Record<string, string>;
  isActive: boolean;
}

// Request Chaining Types
export interface ChainStep {
  id: string;
  order: number;
  requestId?: string; // Reference to saved request, or inline request
  request?: Request; // Inline request definition
  name: string;
  description?: string;
  variableExtractions: Array<{
    name: string;
    path: string; // JSONPath
    description?: string;
  }>;
  continueOnError: boolean;
  delay?: number; // milliseconds to wait before executing
}

export interface Chain {
  id: string;
  name: string;
  description?: string;
  steps: ChainStep[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ChainExecution {
  id: string;
  chainId: string;
  startedAt: Date;
  completedAt?: Date;
  status: 'running' | 'completed' | 'failed' | 'cancelled';
  steps: Array<{
    stepId: string;
    order: number;
    status: 'pending' | 'running' | 'success' | 'failed' | 'skipped';
    request?: Request;
    response?: Response;
    error?: string;
    extractedVariables?: Record<string, any>;
    startedAt?: Date;
    completedAt?: Date;
  }>;
  variables: Record<string, any>;
  error?: string;
}
