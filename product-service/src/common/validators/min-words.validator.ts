import { ValidatorConstraint, ValidatorConstraintInterface, ValidationArguments, registerDecorator, ValidationOptions } from 'class-validator';

@ValidatorConstraint({ name: 'minWords', async: false })
export class MinWordsConstraint implements ValidatorConstraintInterface {
  validate(value: string, args: ValidationArguments) {
    if (typeof value !== 'string') return false;
    const words = value.trim().split(/\s+/);
    const minWords = args.constraints[0] || 3;
    return words.length >= minWords && words[0] !== '';
  }

  defaultMessage(args: ValidationArguments) {
    const minWords = args.constraints[0] || 3;
    return `Field must contain at least ${minWords} words.`;
  }
}

export function MinWords(limit: number, validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [limit],
      validator: MinWordsConstraint,
    });
  };
}
