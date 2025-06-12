declare module '@radix-ui/themes' {
  import { ReactNode } from 'react';

  export interface ThemeProps {
    appearance?: 'light' | 'dark';
    accentColor?: 'tomato' | 'red' | 'crimson' | 'pink' | 'plum' | 'purple' | 'violet' | 'indigo' | 'blue' | 'cyan' | 'teal' | 'green' | 'grass' | 'brown' | 'orange' | 'sky' | 'mint' | 'lime' | 'yellow' | 'amber' | 'gold' | 'bronze' | 'gray';
    grayColor?: 'gray' | 'mauve' | 'slate' | 'sage' | 'olive' | 'sand';
    scaling?: '90%' | '95%' | '100%' | '105%' | '110%';
    radius?: 'none' | 'small' | 'medium' | 'large' | 'full';
    children?: ReactNode;
  }

  export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'solid' | 'outline' | 'ghost' | 'secondary' | 'destructive';
    size?: '1' | '2' | '3';
    children?: ReactNode;
  }

  export interface ToastProps extends React.HTMLAttributes<HTMLDivElement> {
    variant?: 'default' | 'destructive' | 'success' | 'warning';
    title?: string;
    description?: string;
    action?: ReactNode;
    children?: ReactNode;
  }

  export const Theme: React.FC<ThemeProps>;
  export const Button: React.ForwardRefExoticComponent<ButtonProps & React.RefAttributes<HTMLButtonElement>>;
  export const Toast: React.ForwardRefExoticComponent<ToastProps & React.RefAttributes<HTMLDivElement>>;
} 