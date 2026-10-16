import { Rectangle } from "electron";
import joi from "joi";
import { MigrateState } from "@sculptor/helpers/libs/migrate";

export interface ISettingsV5 extends MigrateState {
  windowsState: {
    main: Partial<Rectangle & { leftWidth: number }>;
    settings: Partial<Rectangle>;
    cueSplit: Partial<Rectangle>;
  };
  general: {
    tryDuete: boolean;
    development: {
      displayCueId: boolean;
    };
  };
  styles: {
    externalCueIds: string[];
  };
  plugins: {
    enabled: boolean;
    directory: string;
    list: Record<string, unknown>;
  };
}

export type ISettings = ISettingsV5;

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
      development: joi.object({
        displayCueId: joi.boolean().required(),
      }),
    })
    .required(),
  styles: joi
    .object({
      externalCueIds: joi.array().items(joi.string()).required(),
    })
    .required(),
  plugins: joi
    .object({
      enabled: joi.boolean().required(),
      directory: joi.string().allow("").required(),
      list: joi.object().required(),
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
