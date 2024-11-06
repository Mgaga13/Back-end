interface RequestWithUser {
  user: {
    id: string;
    email: string;
    role: string;
  };
}

export default RequestWithUser;
