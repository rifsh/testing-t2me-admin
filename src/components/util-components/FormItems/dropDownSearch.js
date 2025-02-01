export const filterOption = (input, option) => {
    return option.children.toLowerCase().indexOf(input.toLowerCase()) >=0;
  }