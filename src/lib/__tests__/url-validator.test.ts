import { describe, it, expect } from 'vitest';
import { hasTemplateVariables, isValidUrl, shouldShowUrlError } from '../url-validator';

describe('URL Validator', () => {
  describe('hasTemplateVariables', () => {
    it('should return true for strings with template variables', () => {
      expect(hasTemplateVariables('{{baseUrl}}')).toBe(true);
      expect(hasTemplateVariables('https://{{host}}/api')).toBe(true);
      expect(hasTemplateVariables('https://api.example.com/{{endpoint}}')).toBe(true);
      expect(hasTemplateVariables('{{protocol}}://{{host}}:{{port}}')).toBe(true);
    });

    it('should return false for strings without template variables', () => {
      expect(hasTemplateVariables('https://api.example.com')).toBe(false);
      expect(hasTemplateVariables('http://localhost:3000')).toBe(false);
      expect(hasTemplateVariables('plain text')).toBe(false);
      expect(hasTemplateVariables('')).toBe(false);
    });

    it('should return false for malformed template syntax', () => {
      expect(hasTemplateVariables('{baseUrl}')).toBe(false);
      expect(hasTemplateVariables('{{baseUrl')).toBe(false);
      expect(hasTemplateVariables('baseUrl}}')).toBe(false);
      expect(hasTemplateVariables('{{}}')).toBe(false);
    });
  });

  describe('isValidUrl', () => {
    it('should return true for valid HTTP URLs', () => {
      expect(isValidUrl('http://example.com')).toBe(true);
      expect(isValidUrl('http://api.example.com/v1/users')).toBe(true);
      expect(isValidUrl('http://localhost:3000')).toBe(true);
      expect(isValidUrl('http://192.168.1.1:8080/api')).toBe(true);
    });

    it('should return true for valid HTTPS URLs', () => {
      expect(isValidUrl('https://example.com')).toBe(true);
      expect(isValidUrl('https://api.example.com/v1/users')).toBe(true);
      expect(isValidUrl('https://jsonplaceholder.typicode.com/posts')).toBe(true);
      expect(isValidUrl('https://example.com:443/path?query=value')).toBe(true);
    });

    it('should return true for URLs with template variables', () => {
      expect(isValidUrl('https://{{host}}/api')).toBe(true);
      expect(isValidUrl('{{baseUrl}}/users')).toBe(true);
      expect(isValidUrl('https://api.example.com/{{endpoint}}')).toBe(true);
    });

    it('should return false for invalid URLs', () => {
      expect(isValidUrl('not a url')).toBe(false);
      expect(isValidUrl('ftp://example.com')).toBe(false); // FTP not allowed
      expect(isValidUrl('example.com')).toBe(false); // Missing protocol
      expect(isValidUrl('htt')).toBe(false);
      expect(isValidUrl('https:')).toBe(false);
      expect(isValidUrl('https:/')).toBe(false);
      expect(isValidUrl('https://')).toBe(false);
    });

    it('should return false for empty or very short strings', () => {
      expect(isValidUrl('')).toBe(false);
      expect(isValidUrl('   ')).toBe(false);
      expect(isValidUrl('http')).toBe(false);
      expect(isValidUrl('h')).toBe(false);
    });

    it('should return false for partial URLs being typed', () => {
      expect(isValidUrl('h')).toBe(false);
      expect(isValidUrl('ht')).toBe(false);
      expect(isValidUrl('htt')).toBe(false);
      expect(isValidUrl('http')).toBe(false);
      expect(isValidUrl('https')).toBe(false);
      expect(isValidUrl('https:')).toBe(false);
      expect(isValidUrl('https:/')).toBe(false);
      expect(isValidUrl('https://')).toBe(false);
      expect(isValidUrl('https://e')).toBe(false);
    });

    it('should handle URLs with query parameters and fragments', () => {
      expect(isValidUrl('https://example.com?foo=bar')).toBe(true);
      expect(isValidUrl('https://example.com#section')).toBe(true);
      expect(isValidUrl('https://example.com?foo=bar&baz=qux#section')).toBe(true);
    });
  });

  describe('shouldShowUrlError', () => {
    it('should return true for invalid URLs without template variables', () => {
      expect(shouldShowUrlError('not a url')).toBe(true);
      expect(shouldShowUrlError('example.com')).toBe(true);
      expect(shouldShowUrlError('h')).toBe(true);
      expect(shouldShowUrlError('https:')).toBe(true);
      expect(shouldShowUrlError('ftp://example.com')).toBe(true);
    });

    it('should return false for valid URLs', () => {
      expect(shouldShowUrlError('https://example.com')).toBe(false);
      expect(shouldShowUrlError('http://localhost:3000')).toBe(false);
      expect(shouldShowUrlError('https://api.example.com/v1/users')).toBe(false);
    });

    it('should return false for URLs with template variables', () => {
      expect(shouldShowUrlError('{{baseUrl}}/api')).toBe(false);
      expect(shouldShowUrlError('https://{{host}}/users')).toBe(false);
      expect(shouldShowUrlError('https://api.example.com/{{endpoint}}')).toBe(false);
    });

    it('should return false for empty strings', () => {
      expect(shouldShowUrlError('')).toBe(false);
      expect(shouldShowUrlError('   ')).toBe(false);
    });

    it('should handle whitespace correctly', () => {
      expect(shouldShowUrlError('  https://example.com  ')).toBe(false);
      expect(shouldShowUrlError('  invalid url  ')).toBe(true);
    });
  });
});
