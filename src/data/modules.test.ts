import test from 'node:test';
import assert from 'node:assert/strict';
import { ACADEMY_MODULES } from './modules.ts';
import { CAREER_TRACKS } from './careerTracks.ts';

test('all 22 modules are complete with 9-phase lessons, full dispensa, and >=6 quiz/test questions', () => {
  assert.equal(ACADEMY_MODULES.length, 22);

  for (let i = 0; i < 22; i++) {
    const mod = ACADEMY_MODULES[i];
    assert.equal(mod.id, i + 1, `Module index ${i} should have id ${i + 1}`);
    assert.equal(mod.statoImplementazione, 'completo', `Module ${mod.id} must be completo`);
    assert.ok(mod.lezione, `Module ${mod.id} must have lezione`);
    assert.ok(mod.lezione.fase1_cose.length > 20, `Module ${mod.id} fase1 too short`);
    assert.ok(mod.lezione.fase2_comeFunziona.length >= 3, `Module ${mod.id} fase2 needs steps`);
    assert.ok(mod.lezione.fase3_schemaVisivo.nodes.length >= 2, `Module ${mod.id} needs schema nodes`);
    assert.ok(mod.lezione.fase5_dimostrazione.length >= 1, `Module ${mod.id} needs demo`);
    assert.ok(mod.lezione.fase6_esercitazione.passi.length >= 2, `Module ${mod.id} needs lab steps`);
    assert.ok(mod.quizIniziale.length >= 6, `Module ${mod.id} quizIniziale must have >= 6 questions`);
    assert.ok(mod.testFinale.length >= 6, `Module ${mod.id} testFinale must have >= 6 questions`);
    assert.ok(mod.dispensa.completa.definizioniChiave.length >= 2, `Module ${mod.id} needs dispensa definitions`);
  }
});

test('all careerTrack module links reference valid modules 1..22', () => {
  const validIds = new Set(ACADEMY_MODULES.map((m) => m.id));
  for (const track of CAREER_TRACKS) {
    for (const comp of track.competenzeRichieste) {
      for (const id of comp.moduliCollegati) {
        assert.ok(validIds.has(id), `Track ${track.id} references unknown module ${id}`);
      }
    }
  }
});
