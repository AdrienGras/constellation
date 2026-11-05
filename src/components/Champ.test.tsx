import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Champ } from '@/components/Champ'
import { Input } from '@/components/ui/input'

describe('Champ', () => {
  it('relie l’aide et l’erreur au contrôle', () => {
    render(
      <Champ label="Titre" aide="Trois mots maximum" erreur="Le titre est obligatoire">
        {(p) => <Input {...p} />}
      </Champ>,
    )
    const champ = screen.getByLabelText('Titre')
    const ids = (champ.getAttribute('aria-describedby') ?? '').split(' ')
    expect(ids).toHaveLength(2)
    expect(document.getElementById(ids[0])).toHaveTextContent('Trois mots maximum')
    expect(document.getElementById(ids[1])).toHaveTextContent('Le titre est obligatoire')
    expect(champ).toHaveAttribute('aria-invalid', 'true')
    expect(screen.queryByRole('alert')).toBeNull()
  })

  it('sans aide ni erreur, pas d’aria-describedby ni d’aria-invalid', () => {
    render(<Champ label="Titre">{(p) => <Input {...p} />}</Champ>)
    const champ = screen.getByLabelText('Titre')
    expect(champ).not.toHaveAttribute('aria-describedby')
    expect(champ).not.toHaveAttribute('aria-invalid')
  })

  it('affiche la mention facultatif', () => {
    render(
      <Champ label="Note" facultatif>
        {(p) => <Input {...p} />}
      </Champ>,
    )
    expect(screen.getByText('(facultatif)')).toBeInTheDocument()
  })
})
