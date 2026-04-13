declare module 'react-router-bootstrap' {
  import { ReactNode } from 'react';

  interface LinkContainerProps {
    to: string;
    children: ReactNode;
  }

  export const LinkContainer: React.FC<LinkContainerProps>;
}
