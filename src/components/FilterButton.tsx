import { Button, buttonVariants } from "@/components/ui/button";
import { Skeleton } from "./ui/skeleton";
import useStore from "@/store";
import { useMemo } from "react";

export const FilterButton = (props: { filterCategory: string }) => {
  const { filterCategory } = props;

  const { flatTypes, addFlatType, removeFlatType } = useStore(
    (state) => state.filters
  );

  const toggleflatTypeFilter = () => {
    buttonIsOff ? removeFlatType(filterCategory) : addFlatType(filterCategory);
  };

  const buttonIsOff: boolean = useMemo(
    () => flatTypes.includes(filterCategory),
    [flatTypes]
  );

  return (
    <Button
      size="sm"
      className={`filterButton ${
        buttonIsOff && "bg-secondary text-secondary-foreground"
      }`}
      onClick={() => toggleflatTypeFilter()}
    >
      {filterCategory}
    </Button>
  );
};

export const FilterButtonSkeleton = (props: { length: number }) => {
  return (
    <div style={{ width: `${props.length}px` }}>
      <Skeleton
        className={buttonVariants({
          size: "sm",
          className: `filterButton w-full`,
        })}
      />
    </div>
  );
};
