  // src/model/universal/sub-atoms/validation/validate-datetime.ts
  // Validates and normalizes a value to Date type
  export function validateDatetime(
    value: Date | string | number,
    fieldName: string
  ): Date {
    let date: Date;

    if (value instanceof Date){
        date = value;
    }
    else if (typeof value === "string" || typeof value === "number") {
        date = new Date(value);
    }

    else { throw new Error (`${fieldName} must be a valid date`);
    }

    if (isNaN(date.getTime())){
        throw new Error (`${fieldName} must be a valid date`);
    }

    return date;
  }