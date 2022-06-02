# src/lib/ts/devices/util.ts

### createUInt8Array

```
createUInt8Array = ({
  data,
  tailData,
  size: givenSize,
  fill = 0,
}: {
  data: number[];
  tailData?: number[];
  size?: number;
  fill?: number;
}): Uint8Array
```

Export helper function that creates an `UInt8Array` from set of parameters.
