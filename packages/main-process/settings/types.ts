import { Rectangle } from "electron";
import joi from "joi";
import { MigrateState } from "@sculptor/helpers/libs/migrate";

export interface ISettings extends MigrateState {
  windowsState: {
    main: Partial<Rectangle & { leftWidth: number }>;
    settings: Partial<Rectangle>;
    cueSplit: Partial<Rectangle>;
  };
  general: {
    tryDuete: boolean;
    pluginsDirectory: string;
  };
  styles: {
    externalCueIds: string[];
  };
  plugins: Record<string, unknown>;
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
    main: rectangleSchema.concat(
      joi.object({
        leftWidth: joi.number(),
      }),
    ),
    settings: rectangleSchema,
    cueSplit: rectangleSchema,
  }),
  general: joi
    .object({
      tryDuete: joi.boolean().required(),
      pluginsDirectory: joi.string().allow("").required(),
    })
    .required(),
  styles: joi
    .object({
      externalCueIds: joi.array().items(joi.string()).required(),
    })
    .required(),
  plugins: joi.object().required(),
});

export const validateSettings = (data: unknown): ISettings => {
  const { error, value } = settingsSchema.validate(data);

  if (error) {
    throw error;
  }

  return value as ISettings;
};
