import { ZebuDots } from "./index";

test("fluent json", () => {
  function pairsToObject<T>(pairs: Array<[string, T]>) {
    const obj: { [k: string]: T } = {};
    for (const [k, v] of pairs) {
      obj[k] = v;
    }
    return obj;
  }

  class JsonDots extends ZebuDots {
    get true() {
      return this._return(true);
    }
    get false() {
      return this._return(false);
    }
    get null() {
      return this._return(null);
    }
    value(x: number | string) {
      return this._return(x);
    }
    get array() {
      return this._repeat(JsonDots);
    }
    get object() {
      return this._repeat(JsonPair, pairsToObject);
    }
  }

  class JsonPair extends ZebuDots {
    key(key: string) {
      return this._seq(JsonDots, (value: any) => [key, value]);
    }
  }

  const json = new JsonDots();

  // constants
  expect(json.true).toEqual(true);
  expect(json.false).toEqual(false);
  expect(json.null).toEqual(null);

  // strings and numbers
  expect(json.value(3)).toEqual(3);
  expect(json.value("foo")).toEqual("foo");

  // structures
  expect(json.array.value(1).value(2).value(3).end).toEqual([1, 2, 3]);

  expect(
    json.array.value(1).array.value(2).array.value(3).array.end.end.end.end
  ).toEqual([1, [2, [3, []]]]);

  // prettier-ignore
  expect(
    json.array
      .object
        .key("foo").value(1)
        .key("bar").false
      .end
      .object
        .key("foo").object
          .key("value").value(2)
        .end
        .key("bar").array.null.end
      .end
    .end
  ).toEqual(
    [
      { foo: 1, bar: false }, 
      { foo: { value: 2 }, bar: [null] }
    ]
  )
});
