import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { PokeService } from '../services/pokemon.services';

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
  limit = 50;
  loading = false;
  searchText: string = '';

  constructor(private http: HttpClient, private pokeService: PokeService) {}

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

      const detallesConEstado = pokemonDetails.map(p => ({
        ...p,
        showDetails: false,
        opinion: '' // Para guardar reseña individual
      }));

      this.allPokemons = [...this.allPokemons, ...detallesConEstado];
      this.offset += this.limit;
      this.buscarPokemon();

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

      // Guardar resultados de búsqueda (con o sin reseñas)
      this.guardarResultadosBusqueda();
    }
  }

  guardarResultadosBusqueda() {
    this.pokemons.forEach(pokemon => this.guardarOpinion(pokemon));
  }

  guardarOpinion(pokemon: any) {
    const tipo = pokemon.types.map((t: any) => t.type.name).join(', ');
    const caracteristicas = pokemon.abilities.map((a: any) => a.ability.name).join(', ');
    const estadisticas = pokemon.stats.map((s: any) => `${s.stat.name}: ${s.base_stat}`).join(', ');
    const imagen = this.getImageUrl(pokemon);
    const opinion = pokemon.opinion || '';

    this.pokeService.guardarBusquedas(pokemon.name, tipo, caracteristicas, estadisticas, imagen, opinion)
      .then(() => console.log(`Guardado: ${pokemon.name}`))
      .catch((error) => console.error('Error al guardar búsqueda', error));
  }

  guardarBusquedas(pokemon: string, tipo: string, caracteristicas: string, estadisticas: string, imagen: string, opinion: string) {
    this.pokeService.guardarBusquedas(pokemon, tipo, caracteristicas, estadisticas, imagen, opinion)
      .then(() => console.log('Búsqueda guardada'))
      .catch((error) => console.error('Error al guardar búsqueda', error));
  }

  refrescarPokemons() {
    this.offset = 0;
    this.pokemons = [];
    this.allPokemons = [];
    this.searchText = '';
    this.loadPokemons();
  }

  toggleDetalles(pokemon: any) {
    pokemon.showDetails = !pokemon.showDetails;
  }

  getImageUrl(pokemon: any): string {
    return pokemon?.sprites?.front_default || 'assets/placeholder.png';
  }
}
