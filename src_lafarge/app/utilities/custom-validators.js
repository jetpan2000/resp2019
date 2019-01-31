import { isAlphanumeric, isEmpty } from 'validator';

export function isAlphanumericAllowSpaces(input) {
    return input.split(' ').every(word => isAlphanumeric(word) || isEmpty(word));
}