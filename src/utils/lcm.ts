const lcm_two_numbers = (x: number, y: number) => {
  if (typeof x !== "number" || typeof y !== "number") return false;
  return !x || !y ? 0 : Math.abs((x * y) / gcd_two_numbers(x, y));
};

const gcd_two_numbers = (x: number, y: number) => {
  x = Math.abs(x);
  y = Math.abs(y);
  while (y) {
    var t = y;
    y = x % y;
    x = t;
  }
  return x;
};
export default lcm_two_numbers;
