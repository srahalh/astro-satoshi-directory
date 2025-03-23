import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import dataListings from "@/data/listings.json";
import { cn } from "@/lib/utils";
import { filteredTags, searchKeyword } from "@/store";
import { useStore } from "@nanostores/react";
import { useMemo } from "react";
import { ExternalLink } from "lucide-react";

export default function ListWebsites() {
  const search = useStore(searchKeyword);
  const tags = useStore(filteredTags);

  const filteredListings = useMemo(() => {
    if (!search && tags.length === 0) return dataListings.listings;
    return dataListings.listings.filter((listing) => {
      if (
        tags.length > 0 &&
        !tags.every((tag) => listing.categories.includes(tag))
      ) {
        return false;
      }
      if (!listing.title.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [search, tags]);

  return (
    <div
      className={cn(
        "container mx-auto px-4 md:px-0",
        "grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-3 xl:grid-cols-4",
      )}
    >
      {filteredListings.map((listing) => {
        const ContentWrapper = listing.website ? 'a' : 'div';
        const wrapperProps = listing.website ? {
          href: listing.website,
          target: "_blank",
          rel: "noopener noreferrer"
        } : {};

        return (
          <ContentWrapper
            key={listing.title}
            className={cn(
              "rounded bg-background p-4 shadow",
              "flex flex-col gap-4",
              "relative",
              "transition-all duration-300 ease-in-out",
              "hover:-translate-y-1 hover:shadow-lg",
              listing.website && "group cursor-pointer"
            )}
            {...wrapperProps}
          >
            {listing.website && (
              <div className="absolute right-4 top-4 opacity-0 transition-opacity group-hover:opacity-100">
                <ExternalLink className="h-4 w-4 text-muted-foreground" />
              </div>
            )}
            <div className="flex gap-2 items-center">
              <p className="flex-1 text-sm font-semibold">{listing.title}</p>
            </div>
            <div className="flex flex-1 flex-col justify-between gap-2">
              <div className="flex flex-col gap-1">
                <p className="line-clamp-6 text-sm text-muted-foreground">
                  {listing.description}
                </p>
              </div>
              <Separator className="my-2" />
                <div className="flex flex-col gap-1 text-sm text-muted-foreground">
                {listing.province && (
                  <span>📍 {listing.province}</span>
                )}
                {listing.contact && (
                  <span>📧 <a href={`mailto:${listing.contact}`} className="hover:underline">{listing.contact}</a></span>
                )}
                {listing.paymentMethods && (
                  <div className="flex flex-wrap gap-1">
                  <span className="text-sm">💳 </span>
                  {listing.paymentMethods.join(', ')}
                  </div>
                )}
                {listing.website && (
                  <span>🌐 {listing.website}</span>
                )}
                {listing.submittedAt && (
                  <span className="text-sm text-muted-foreground">
                  📅 Creado el: {new Date(listing.submittedAt).toLocaleDateString('es-ES', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                  </span>
                )}
                </div>
              <Separator className="my-2" />
              {listing.categories && (
                <div className="flex flex-wrap gap-1">
                  {listing.categories.map((tag) => (
                    <Badge key={tag} className="px-1 py-0">{tag}</Badge>
                  ))}
                </div>
              )}
            </div>
          </ContentWrapper>
        );
      })}
    </div>
  );
}