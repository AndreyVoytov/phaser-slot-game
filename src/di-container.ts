import { Container } from "inversify";
import { AudioManager } from "./managers/AudioManager";
import { TYPES } from "./di-types";
import getDecorators from "inversify-inject-decorators";
import { SymbolStore } from "./store/SymbolStore";
import { CombinationManager } from "./managers/CombinationManager";

const container = new Container();

container.bind<AudioManager>(TYPES.AudioManager).to(AudioManager).inSingletonScope();
container.bind<SymbolStore>(TYPES.SymbolStore).to(SymbolStore).inSingletonScope();
container.bind<CombinationManager>(TYPES.CombinationManager).to(CombinationManager).inSingletonScope();

const { lazyInject } = getDecorators(container);

export { container, lazyInject };
