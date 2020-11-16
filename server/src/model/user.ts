export interface User {
  id: string;
  username: string;
  name: string;
  camps: string[];
}

export interface UserWithPassword extends User {
  password: string;
}