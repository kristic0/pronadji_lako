export interface IJwtUserRequest extends Request {
  user: {
    userId: number;
    email: string;
  };
}
