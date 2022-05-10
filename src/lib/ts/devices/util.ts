export const createUInt8Array = ({
  data,
  tailData,
  size: givenSize,
  fill = 0,
}: {
  data: number[];
  tailData?: number[];
  size?: number;
  fill?: number;
}): Uint8Array => {
  const requiredSize = data.length + (tailData?.length ?? 0);
  if (givenSize && givenSize < requiredSize)
    throw Error('Given size is too small for the data provided');

  const size = givenSize || requiredSize;
  const array = new Uint8Array(size).fill(fill);

  array.set(data);
  if (tailData) {
    array.set(tailData, size - tailData.length);
  }
  return array;
};
