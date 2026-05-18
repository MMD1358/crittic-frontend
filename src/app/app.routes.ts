import { Routes } from '@angular/router';
import { PrincipalComponent } from './pages/principal/principal.component';
import { JuegosComponent } from './pages/juegos/juegos.component';
import { LoginComponent } from './pages/login/login.component';
import { RegistroComponent } from './pages/registro/registro.component';
import { PlantillaJuegoComponent } from './pages/plantilla-juego/plantilla-juego.component';
import { PerfilComponent } from './pages/perfil/perfil.component';
import { ChatsComponent } from './pages/chats/chats.component';

export const routes: Routes = [
  {
    path: '',
    component: PrincipalComponent
  },
  {
    path: 'juegos',
    component: JuegosComponent
  },
  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: 'registro',
    component: RegistroComponent
  },
  {
    path: 'juego/:id',
    component: PlantillaJuegoComponent
  },
  {
    path: 'perfil/:username',
    component: PerfilComponent
  },
  {
    path: 'chats',
    component: ChatsComponent
  },
  {
    path: '**',
    redirectTo: ''
  }
];