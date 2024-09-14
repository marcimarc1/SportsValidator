export function inverse(value) {
  if (typeof value === 'number') {
    if (value === 0) {
      throw new Error('Cannot calculate inverse of zero.');
    }
    return 1 / value;
  } else if (Array.isArray(value) && value.length === 2 && value[0].length === 2) {
    const [[a, b], [c, d]] = value;
    const determinant = a * d - b * c;
    
    if (determinant === 0) {
      throw new Error('Matrix is not invertible (determinant is zero).');
    }
    
    return [
      [d / determinant, -b / determinant],
      [-c / determinant, a / determinant]
    ];
  } else {
    throw new Error('Invalid input. Please provide a number or a 2x2 matrix.');
  }
}

