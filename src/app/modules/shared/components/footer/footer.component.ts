import { Component } from '@angular/core';
import packageJson from '../../../../../../package.json';

@Component({
  selector: 'app-footer',
  standalone: true,
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.css'
})
export class FooterComponent {
  currentYear = new Date().getFullYear();
  version = packageJson.version;
  creator = 'n2agames';
  repositoryUrl = 'https://github.com/n2agames/poke-paper-web';
}
