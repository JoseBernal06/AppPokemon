import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';

interface Pokemon {
  name: string;
  url: string;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, IonicModule, FormsModule],
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit {
  pokemons: any[] = [];
  allPokemons: any[] = [];
  offset = 0;
  limit = 500;
  loading = false;
  searchText: string = '';

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.loadPokemons();
  }

  async loadPokemons(event?: any) {
    if (this.loading) return;
    this.loading = true;

    try {
      const res = await this.http
        .get<any>(`https://pokeapi.co/api/v2/pokemon?offset=${this.offset}&limit=${this.limit}`)
        .toPromise();

      const pokemonRequests = res.results.map((pokemon: Pokemon) =>
        this.http.get<any>(pokemon.url).toPromise()
      );

      const pokemonDetails = await Promise.all(pokemonRequests);

      // Añadir propiedad para mostrar u ocultar detalles
      const detallesConEstado = pokemonDetails.map(p => ({ ...p, showDetails: false }));

      this.allPokemons = [...this.allPokemons, ...detallesConEstado];
      this.offset += this.limit;
      this.buscarPokemon(); // Aplicar filtro activo

      if (event) {
        event.target.complete();
        if (res.next === null) {
          event.target.disabled = true;
        }
      }
    } catch (error) {
      console.error('Error al cargar Pokémon', error);
      if (event) event.target.complete();
    } finally {
      this.loading = false;
    }
  }

  buscarPokemon() {
    const texto = this.searchText.trim().toLowerCase();

    if (!texto) {
      this.pokemons = [...this.allPokemons];
    } else {
      this.pokemons = this.allPokemons.filter(p =>
        p.name.toLowerCase().includes(texto)
      );
    }
  }

  toggleDetalles(pokemon: any) {
    pokemon.showDetails = !pokemon.showDetails;
  }

  getImageUrl(pokemon: any): string {
    return pokemon?.sprites?.front_default || 'assets/placeholder.png';
  }
}
