import { Container } from "inversify";
import { AudioManager } from "./managers/AudioManager";
import { TYPES } from "./types";
import getDecorators from "inversify-inject-decorators";
import { SymbolStore } from "./store/SymbolStore";

const container = new Container();

container.bind<AudioManager>(TYPES.AudioManager).to(AudioManager).inSingletonScope();
container.bind<SymbolStore>(TYPES.SymbolStore).to(SymbolStore).inSingletonScope();

const { lazyInject } = getDecorators(container);

export { container, lazyInject };
