import { ValidatorConstraint, ValidatorConstraintInterface, ValidationArguments, registerDecorator, ValidationOptions } from 'class-validator';

@ValidatorConstraint({ name: 'isStrongPassword', async: false })
export class IsStrongPasswordConstraint implements ValidatorConstraintInterface {
  validate(password: string, args: ValidationArguments) {
    if (!password) return false;
    if (password.length < 8) return false;
    if (/\s/.test(password)) return false; // no spaces
    const digitCount = (password.match(/\d/g) || []).length;
    return digitCount >= 2;
  }

  defaultMessage(args: ValidationArguments) {
    return 'Password must be at least 8 characters long, contain no spaces, and have at least 2 digits (numbers).';
  }
}

export function IsStrongPassword(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsStrongPasswordConstraint,
    });
  };
}

@ValidatorConstraint({ name: 'isValidDomain', async: false })
export class IsValidDomainConstraint implements ValidatorConstraintInterface {
  validate(email: string, args: ValidationArguments) {
    if (!email) return false;
    const allowedDomains = ['.com', '.net', '.org', '.id'];
    const lowerEmail = email.toLowerCase();
    
    const atIndex = lowerEmail.lastIndexOf('@');
    if (atIndex === -1) return false;
    const domain = lowerEmail.slice(atIndex + 1);
    
    return allowedDomains.some(ext => domain.endsWith(ext));
  }

  defaultMessage(args: ValidationArguments) {
    return 'Email must have a valid domain extension (.com, .net, .org, or .id).';
  }
}

export function IsValidDomain(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsValidDomainConstraint,
    });
  };
}
