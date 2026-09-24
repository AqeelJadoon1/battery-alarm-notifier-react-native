import { registerRootComponent } from "expo";
import App from "./App";

// registerRootComponent calls AppRegistry.registerComponent('main', () => App)
// and also handles whether the app is loaded normally or via Expo Go/dev client.
registerRootComponent(App);