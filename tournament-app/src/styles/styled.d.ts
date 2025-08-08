import 'styled-components';
import { Theme } from './themes'; // Import your custom Theme interface

// By declaring the module, we can 'merge' our own interface with the original.
declare module 'styled-components' {
  // This extends the DefaultTheme interface with all the properties of our custom Theme.
  export interface DefaultTheme extends Theme {}
}