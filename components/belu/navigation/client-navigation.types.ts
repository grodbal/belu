import type { BeluIconName } from "../foundations/icons";

export type ClientNavigationItem<ItemId extends string = string> = {
  id: ItemId;
  label: string;
  icon: BeluIconName;
  prominent?: boolean;
};

export type ClientNavigationHandler<ItemId extends string = string> = (
  itemId: ItemId,
) => void;
