import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { IonicModule } from '@ionic/angular';

interface Pokemon {
  name: string;
  url: string;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, IonicModule],
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit {
  pokemons: any[] = [];
  offset = 0;
  limit = 20;
  loading = false;

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.loadPokemons();
  }

  loadPokemons(event?: any) {
    if (this.loading) return;
    this.loading = true;

    this.http
      .get<any>(`https://pokeapi.co/api/v2/pokemon?offset=${this.offset}&limit=${this.limit}`)
      .subscribe((res) => {
        // Realiza una segunda llamada para obtener los detalles completos de cada Pokémon
        const pokemonRequests = res.results.map((pokemon: Pokemon) => 
          this.http.get<any>(pokemon.url).toPromise()
        );

        // Espera a que todas las solicitudes de detalles de los Pokémon se resuelvan
        Promise.all(pokemonRequests).then((pokemonDetails) => {
          this.pokemons = [...this.pokemons, ...pokemonDetails];
          this.offset += this.limit;
          this.loading = false;

          if (event) {
            event.target.complete();
          }

          // Desactiva el scroll infinito si ya no hay más Pokémon
          if (res.next === null && event) {
            event.target.disabled = true;
          }
        }).catch(() => {
          this.loading = false;
          if (event) {
            event.target.complete();
          }
        });
      });
  }

  getImageUrl(index: number): string {
    return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${index + 1}.png`;
  }
}
