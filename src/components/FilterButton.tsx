import { Button, buttonVariants } from "@/components/ui/button";
import { Skeleton } from "./ui/skeleton";

export const FilterButton = (props: { filterCategory: string }) => {
  const { filterCategory } = props;

  const toggleflatTypeFilter = (type: string) => {
    //todo set app state
    console.log("toggle flat type:", type);
  };

  return (
    <Button
      size="sm"
      className="filterButton"
      onClick={() => toggleflatTypeFilter(filterCategory)}
    >
      {filterCategory}
    </Button>
  );
};

export const FilterButtonSkeleton = () => {
  return (
    <Skeleton
      className={buttonVariants({
        size: "sm",
        className: "filterButton w-24",
      })}
    />
  );
};
