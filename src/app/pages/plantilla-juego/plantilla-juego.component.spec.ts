import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlantillaJuegoComponent } from './plantilla-juego.component';

describe('PlantillaJuegoComponent', () => {
  let component: PlantillaJuegoComponent;
  let fixture: ComponentFixture<PlantillaJuegoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PlantillaJuegoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PlantillaJuegoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
