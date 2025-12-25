import { Book } from 'lucide-react';

interface BookCardProps {
  id: string;
  title: string;
  author: string;
  publisher: string;
  edition?: string | null;
  totalCopies: number;
  availableCopies: number;
  coverUrl?: string | null;
  category?: string | null;
  onClick?: () => void;
}

export function BookCard({
  title,
  author,
  publisher,
  edition,
  totalCopies,
  availableCopies,
  coverUrl,
  category,
  onClick,
}: BookCardProps) {
  const isAvailable = availableCopies > 0;

  return (
    <div
      className="book-card cursor-pointer group"
      onClick={onClick}
    >
      {/* Cover Image */}
      <div className="aspect-[3/4] bg-muted relative overflow-hidden">
        {coverUrl ? (
          <img
            src={coverUrl}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5">
            <Book className="h-16 w-16 text-primary/30" />
          </div>
        )}
        
        {/* Category badge */}
        {category && (
          <span className="absolute top-2 left-2 px-2 py-1 text-xs font-medium bg-primary text-primary-foreground rounded">
            {category}
          </span>
        )}

        {/* Availability indicator */}
        <div className={`absolute top-2 right-2 w-3 h-3 rounded-full ${isAvailable ? 'bg-library-success' : 'bg-destructive'}`} />
      </div>

      {/* Content */}
      <div className="p-4 space-y-2">
        <h3 className="font-semibold text-foreground line-clamp-2 group-hover:text-primary transition-colors">
          {title}
        </h3>
        <p className="text-sm text-muted-foreground line-clamp-1">
          by {author}
        </p>
        <p className="text-xs text-muted-foreground">
          {publisher}
          {edition && ` • ${edition} Edition`}
        </p>
        
        {/* Availability */}
        <div className="pt-2 border-t border-border">
          <p className={`text-sm font-medium ${isAvailable ? 'text-library-success' : 'text-destructive'}`}>
            Available: {availableCopies} of {totalCopies} copies
          </p>
        </div>
      </div>
    </div>
  );
}
