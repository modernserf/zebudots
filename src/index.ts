const id = <T>(x: T) => x;

export class ZebuDots {
  constructor(public _return: (t: any) => any = id) {}
  _repeat(Class: new (t: any) => any, mapFn: any = id) {
    const values: any[] = [];
    const outerReturn = () => this._return(mapFn(values));
    class ZebuStruct extends Class {
      get end() {
        return outerReturn();
      }
    }

    return new ZebuStruct(function (this: any, val: any) {
      values.push(val);
      return this;
    });
  }
  _seq(Class: new (t: any) => any, mapFn: any = id) {
    return new Class((value: any) => this._return(mapFn(value)));
  }
}
