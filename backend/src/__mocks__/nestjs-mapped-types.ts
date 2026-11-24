type Type<T = any> = new (...args: any[]) => T;

export function inheritValidationMetadata(_parentClass: Type<any>, _targetClass: Type<any>) { }

export function inheritPropertyInitializers(_target: any, _source: any, _keys?: string[]) { }

export function inheritTransformationMetadata(_parentClass: Type<any>, _targetClass: Type<any>) { }

export function applyIsOptionalDecorator(_targetClass: Type<any>, _propKey: string) { }

export function PartialType<T>(ClassRef: Type<T>): Type<Partial<T>> {
    return class PartialClass extends (ClassRef as Type<any>) { } as Type<Partial<T>>;
}

export function OmitType<T, K extends keyof T>(
    ClassRef: Type<T>,
    _keys: readonly K[],
): Type<Omit<T, K>> {
    return class OmitClass extends (ClassRef as Type<any>) { } as Type<Omit<T, K>>;
}

export function PickType<T, K extends keyof T>(
    ClassRef: Type<T>,
    _keys: readonly K[],
): Type<Pick<T, K>> {
    return class PickClass extends (ClassRef as Type<any>) { } as Type<Pick<T, K>>;
}

export function IntersectionType<A, B>(ClassA: Type<A>, ClassB: Type<B>): Type<A & B> {
    return class IntersectionClass extends (ClassA as Type<any>) {
        constructor(...args: any[]) {
            super(...args);
            Object.assign(this, new (ClassB as Type<any>)(...args));
        }
    } as Type<A & B>;
}