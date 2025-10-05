export interface Request {
  id: string;
  name: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD' | 'OPTIONS';
  url: string;
  headers: Record<string, string>;
  params: Record<string, string>;
  body?: string;
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
