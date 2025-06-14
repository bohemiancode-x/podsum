import '@testing-library/jest-dom';

declare global {
  namespace jest {
    interface Matchers<R> {
      toBeInTheDocument(): R;
      toHaveTextContent(text: string | RegExp): R;
      toBeVisible(): R;
      toBeDisabled(): R;
      toHaveClass(...classNames: string[]): R;
      toHaveAttribute(attr: string, value?: string): R;
      toHaveStyle(css: Record<string, unknown>): R;
      toBeChecked(): R;
      toBeRequired(): R;
      toBeInvalid(): R;
      toBeValid(): R;
      toHaveValue(value?: string | string[] | number): R;
      toHaveFocus(): R;
      toBeEmpty(): R;
      toBeEnabled(): R;
      toBeEmptyDOMElement(): R;
      toHaveDescription(text?: string | RegExp): R;
      toHaveDisplayValue(value: string | string[] | RegExp): R;
      toHaveFormValues(expectedValues: Record<string, unknown>): R;
      toHaveRole(role: string, options?: { hidden?: boolean }): R;
      toHaveAccessibleDescription(description?: string | RegExp): R;
      toHaveAccessibleName(name?: string | RegExp): R;
      toBePartiallyChecked(): R;
      toHaveErrorMessage(text?: string | RegExp): R;
    }
  }
} 