type LastState<OutType> = {
  value: <ThisType>(x: ThisType) => OutType;
};

// array state + stack
class ArrayState<OutType, ArrayType = never> {
  private arrayValues: ArrayType[] = [];
  constructor(private readonly lastState: LastState<OutType>) {}
  get true() {
    const self = this as ArrayState<OutType, ArrayType | boolean>;
    self.arrayValues.push(true);
    return self;
  }
  get false() {
    const self = this as ArrayState<OutType, ArrayType | boolean>;
    self.arrayValues.push(false);
    return self;
  }
  get null() {
    const self = this as ArrayState<OutType, ArrayType | null>;
    self.arrayValues.push(null);
    return self;
  }
  value<T>(value: T) {
    const self = this as ArrayState<OutType, ArrayType | T>;
    self.arrayValues.push(value);
    return self;
  }
  get array() {
    return new ArrayState(this);
  }
  get object() {
    return new ObjectState(this);
  }
  get end() {
    return this.lastState.value(this.arrayValues);
  }
}

// object state + stack
class ObjectState<LastStateType> {
  private objectValues: Record<string, unknown> = {};
  constructor(
    private readonly lastState: { value: <T>(x: T) => LastStateType }
  ) {}
  key(key: string) {
    return new ObjectFieldState((value) => this.resumeObject(key, value));
  }
  get end() {
    return this.lastState.value(this.objectValues);
  }
  private resumeObject<T>(key: string, value: T) {
    this.objectValues[key] = value;
    return this;
  }
}

class ObjectFieldState {
  constructor(private readonly resumeObject: (value: any) => any) {}
  get true() {
    return this.resumeObject(true);
  }
  get false() {
    return this.resumeObject(false);
  }
  get null() {
    return this.resumeObject(null);
  }
  value<T>(value: T) {
    return this.resumeObject(value);
  }
  get array() {
    return new ArrayState(this);
  }
  get object() {
    return new ObjectState(this);
  }
}

// root state
const json = {
  true: true,
  false: false,
  null: null,
  value: <T>(x: T) => x,
  get array() {
    return new ArrayState(json);
  },
  get object() {
    return new ObjectState(json);
  },
};
