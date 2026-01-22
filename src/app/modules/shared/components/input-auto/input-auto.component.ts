import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'input-auto',
  imports: [CommonModule, FormsModule],
  templateUrl: './input-auto.component.html',
  styleUrl: './input-auto.component.css',
})
export class InputAuto implements OnChanges {
  @Input() pokemonNames: string[] = [];
  @Input() placeholder: string = 'Buscar Pokémon...';
  @Output() onSelect = new EventEmitter<string>();

  searchText: string = '';
  filteredOptions: string[] = [];
  showDropdown: boolean = false;
  selectedIndex: number = -1;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['pokemonNames']) {
      this.filteredOptions = [];
      this.showDropdown = false;
      this.selectedIndex = -1;
    }
  }

  onInputChange(): void {
    
    if (this.searchText.trim() === '') {
      this.filteredOptions = [];
      this.showDropdown = false;
      return;
    }

    this.filteredOptions = this.pokemonNames.filter((pokemon) =>
      pokemon.toLowerCase().includes(this.searchText.toLowerCase())
    );
    
    this.showDropdown = this.filteredOptions.length > 0;
    this.selectedIndex = -1;
  }

  selectOption(pokemon: string): void {
    this.searchText = pokemon as string;
    this.showDropdown = false;
    this.onSelect.emit(pokemon);
  }

  onKeyDown(event: KeyboardEvent): void {
    if (!this.showDropdown) return;

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        this.selectedIndex = Math.min(
          this.selectedIndex + 1,
          this.filteredOptions.length - 1
        );
        break;
      case 'ArrowUp':
        event.preventDefault();
        this.selectedIndex = Math.max(this.selectedIndex - 1, -1);
        break;
      case 'Enter':
        event.preventDefault();
        if (this.selectedIndex >= 0) {
          this.selectOption(this.filteredOptions[this.selectedIndex]);
        }
        break;
      case 'Escape':
        this.showDropdown = false;
        this.selectedIndex = -1;
        break;
    }
  }

  onBlur(): void {
    // Delay para permitir el click en opciones
    setTimeout(() => {
      this.showDropdown = false;
      this.selectedIndex = -1;
    }, 200);
  }

  getInputValue(): string {
    return this.searchText;
  }

  clearInput(): void {
    this.searchText = '';
    this.filteredOptions = [];
    this.showDropdown = false;
    this.selectedIndex = -1;
  }
}
