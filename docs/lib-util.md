# src/lib/ts/util.ts

Exports two helpers functions.

# Functions

### htmlRGBToColor
`export const htmlRGBToColor = (rgbString: string): Color`

Parse a string containing a color in a RGB HEX format, returning a `Color` type object of the respective color.

### byteArrayToString
`export const byteArrayToString = (data: Uint8Array): string`

Returns a string out of the content of a `Uint8Array`.
