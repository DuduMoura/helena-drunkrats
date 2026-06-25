import { getIngredients } from '@/shared/lib/cocktaildb'
import type { CocktailDBDrink } from '@/shared/lib/cocktaildb'

interface DrinkCardProps {
  drink: CocktailDBDrink
}

export default function DrinkCard({ drink }: DrinkCardProps) {
  const ingredients = getIngredients(drink)
  const isFallback = drink.idDrink === 'fallback'

  return (
    <article
      className="rounded-2xl overflow-hidden"
      style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
      aria-label={`Drink sorteado: ${drink.strDrink}`}
    >
      {drink.strDrinkThumb && !isFallback ? (
        <img
          src={drink.strDrinkThumb}
          alt={drink.strDrink}
          className="w-full h-48 object-cover"
          loading="lazy"
        />
      ) : (
        <div
          className="w-full h-48 flex items-center justify-center text-6xl"
          style={{ background: 'var(--bg)' }}
          aria-hidden="true"
        >
        </div>
      )}

      <div className="p-5 flex flex-col gap-4">
        <div>
          <p className="text-label mb-1" style={{ color: 'var(--accent)' }}>
            {drink.strCategory}
          </p>
          <h2 className="text-headline font-black" style={{ color: 'var(--text-h)' }}>
            {drink.strDrink}
          </h2>
          {isFallback && (
            <p className="text-body mt-1" style={{ color: 'var(--text)' }}>
              Sem conexão? Sem problema — o shot clássico resolve.
            </p>
          )}
        </div>

        {ingredients.length > 0 && (
          <div>
            <p className="text-label mb-2" style={{ color: 'var(--text)' }}>
              Ingredientes
            </p>
            <ul className="flex flex-col gap-1.5" role="list">
              {ingredients.map(({ ingredient, measure }, i) => (
                <li
                  key={`${ingredient}-${i}`}
                  className="flex items-center justify-between text-body py-1.5 px-3 rounded-lg"
                  style={{ background: 'var(--bg)' }}
                >
                  <span style={{ color: 'var(--text-h)' }}>{ingredient}</span>
                  {measure && (
                    <span
                      className="text-label ml-4 shrink-0"
                      style={{ color: 'var(--text)' }}
                    >
                      {measure.trim()}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </article>
  )
}
