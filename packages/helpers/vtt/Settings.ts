// A settings object holds key/value pairs and will ignore anything but the first
// assignment to a specific key.
export class Settings {
  protected values: Record<string, any> = {};

  // Only accept the first assignment to any key.
  public set(k: string, v: any) {
    if (!this.get(k) && v !== "") {
      this.values[k] = v;
    }
  }

  // Return the value for a key, or a default value.
  // If 'defaultKey' is passed then 'dflt' is assumed to be an object with
  // a number of possible default values as properties where 'defaultKey' is
  // the key of the property that will be chosen; otherwise it's assumed to be
  // a single value.
  get<Default>(k: string, dflt?: Default, defaultKey?: keyof Default) {
    if (defaultKey) {
      if (this.has(k)) {
        return this.values[k];
      } else {
        if (dflt) {
          return dflt[defaultKey];
        } else {
          throw new Error();
        }
      }
    }
    return this.has(k) ? this.values[k] : dflt;
  }

  // Check whether we have a value for a key.
  has(k: string) {
    return k in this.values;
  }

  /** Accept a setting if its one of the given alternatives. */
  alt<T>(k: string, v: T, a: T[]) {
    for (let n = 0; n < a.length; ++n) {
      if (v === a[n]) {
        this.set(k, v);
        break;
      }
    }
  }

  // Accept a setting if its a valid (signed) integer.
  integer(k: string, v: string) {
    if (/^-?\d+$/.test(v)) {
      // integer
      this.set(k, parseInt(v, 10));
    }
  }

  // Accept a setting if its a valid percentage.
  percent(k: string, vArg: string) {
    let m;
    if ((m = vArg.match(/^([\d]{1,3})(\.[\d]*)?%$/))) {
      const v = parseFloat(vArg);
      if (v >= 0 && v <= 100) {
        this.set(k, v);
        return true;
      }
    }
    return false;
  }
}
