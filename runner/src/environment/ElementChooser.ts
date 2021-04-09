import Debug from "debug";
import { EventEmitter } from "events";
import { BrowserContext } from "playwright";

import { ElementChooserValue, ElementChosen } from "../types";

const debug = Debug("qawolf:ElementChooser");

export class ElementChooser extends EventEmitter {
  _context?: BrowserContext;
  _contextEmitter?: EventEmitter;
  _isActive = false;
  _lastElementChosen: ElementChosen | null = null;

  _setActive(value: boolean): void {
    this._isActive = value;

    if (!value) {
      // clear the previous chosen value
      this._lastElementChosen = null;
    }

    debug("emit %j", this.value);
    this.emit("elementchooser", this.value);
  }

  async setContext(context: BrowserContext): Promise<void> {
    this._context = context;
    this._setActive(false);

    // stop emitting chooser values
    this._contextEmitter?.removeAllListeners();

    // emit to a separate emitter per context
    const contextEmitter = new EventEmitter();
    this._contextEmitter = contextEmitter;

    contextEmitter.on("qawElementChosen", (event: ElementChosen) => {
      this._lastElementChosen = event;
      debug("emit %j", this.value);

      if (this._isActive) {
        this.emit("elementchooser", this.value);
      }
    });

    await context.exposeBinding("qawElementChosen", async (_, event) =>
      contextEmitter.emit("qawElementChosen", event)
    );
  }

  async start(): Promise<void> {
    this._setActive(true);

    const promises = (this._context?.pages() || [])
      .filter((page) => !page.isClosed())
      .map((page) => {
        return page.evaluate(() => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const qawolf: any = (window as any).qawolf;
          qawolf.actionRecorder.stop();
          qawolf.elementChooser.start();
        });
      });

    await Promise.all(promises);
  }

  async stop(): Promise<void> {
    this._setActive(false);

    const promises = (this._context?.pages() || [])
      .filter((page) => !page.isClosed())
      .map((page) => {
        return page.evaluate(() => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const qawolf: any = (window as any).qawolf;
          qawolf.elementChooser.stop();
          qawolf.actionRecorder.start();
        });
      });

    await Promise.all(promises);
  }

  get value(): ElementChooserValue {
    return {
      ...(this._lastElementChosen || {}),
      isActive: this._isActive,
    };
  }
}
