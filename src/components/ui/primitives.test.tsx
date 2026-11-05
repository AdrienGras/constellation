import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableRow } from '@/components/ui/table'
import { ToggleGroup, ToggleGroupItem, ToggleLiens } from '@/components/ui/toggle-group'

describe('primitives', () => {
  it('Button par défaut est en primaire', () => {
    render(<Button>Valider</Button>)
    expect(screen.getByRole('button', { name: 'Valider' }).className).toContain('bg-primary')
  })

  it('Button prend les variantes et tailles du design system', () => {
    render(
      <Button variant="outline" size="sm">
        Annuler
      </Button>,
    )
    const bouton = screen.getByRole('button', { name: 'Annuler' })
    expect(bouton.className).toContain('border-trait-fort')
    expect(bouton.className).toContain('h-9')
  })

  it('Badge succes affiche son texte', () => {
    render(<Badge variant="succes">Validé</Badge>)
    expect(screen.getByText('Validé').className).toContain('bg-succes-doux')
  })

  it('Alert attention a role="alert" seulement si demandé', () => {
    const { rerender } = render(
      <Alert variant="attention">
        <AlertDescription>Prudence</AlertDescription>
      </Alert>,
    )
    expect(screen.queryByRole('alert')).toBeNull()
    rerender(
      <Alert variant="attention" role="alert">
        <AlertDescription>Prudence</AlertDescription>
      </Alert>,
    )
    expect(screen.getByRole('alert')).toHaveTextContent('Prudence')
  })

  it('ToggleLiens rend des liens, dont un aria-current="page"', () => {
    render(
      <ToggleLiens
        label="Affichage"
        items={[
          { href: '#/graphe', label: 'Graphe', actif: true },
          { href: '#/liste', label: 'Liste', actif: false },
        ]}
      />,
    )
    const nav = screen.getByRole('navigation', { name: 'Affichage' })
    expect(nav).toBeInTheDocument()
    const liens = screen.getAllByRole('link')
    expect(liens).toHaveLength(2)
    expect(liens[0]).toHaveAttribute('aria-current', 'page')
    expect(liens[1]).not.toHaveAttribute('aria-current')
  })

  it('Dialog a un bouton de fermeture en français', async () => {
    render(
      <Dialog defaultOpen>
        <DialogContent>
          <DialogTitle>Titre</DialogTitle>
          <DialogDescription>Description</DialogDescription>
        </DialogContent>
      </Dialog>,
    )
    expect(screen.getByRole('dialog', { name: 'Titre' })).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Fermer' }))
    expect(screen.queryByRole('dialog')).toBeNull()
  })

  it('les groupes de bascule ne rognent pas le contour de focus (pas d’overflow-hidden)', () => {
    render(
      <>
        <ToggleLiens label="Liens" items={[{ href: '#/a', label: 'A', actif: true }]} />
        <ToggleGroup type="single" aria-label="Groupe">
          <ToggleGroupItem value="a">A</ToggleGroupItem>
        </ToggleGroup>
      </>,
    )
    expect(screen.getByRole('navigation', { name: 'Liens' }).className).not.toContain('overflow-hidden')
    expect(screen.getByLabelText('Groupe').className).not.toContain('overflow-hidden')
  })

  it('Table : le conteneur défilable est focalisable au clavier', () => {
    const { container } = render(
      <Table>
        <TableBody>
          <TableRow>
            <TableCell>x</TableCell>
          </TableRow>
        </TableBody>
      </Table>,
    )
    expect(container.querySelector('[data-slot="table-container"]')).toHaveAttribute('tabindex', '0')
  })
})
