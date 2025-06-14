import { Rectangle } from "electron";
import joi from "joi";
import { MigrateState } from "shared/libs/migrate";

export interface ISettings extends MigrateState {
  windowsState: {
    main: Partial<Rectangle>;
    settings: Partial<Rectangle>;
    cueSplit: Partial<Rectangle>;
  };
  externalCueIds: string[];
  generalSettings: {
    tryDuete: boolean;
  };
}

const rectangleSchema = joi.object({
  height: joi.number().required(),
  width: joi.number().required(),
  x: joi.number(),
  y: joi.number(),
});

export const settingsSchema = joi.object({
  version: joi.number().required(),
  windowsState: joi.object({
    main: rectangleSchema,
    settings: rectangleSchema,
    cueSplit: rectangleSchema,
  }),
  externalCueIds: joi.array().items(joi.string()).required(),
  generalSettings: joi
    .object({
      tryDuete: joi.boolean().required(),
    })
    .required(),
});

export const validateSettings = (data: unknown): ISettings => {
  const { error, value } = settingsSchema.validate(data);

  if (error) {
    throw error;
  }

  return value as ISettings;
};
