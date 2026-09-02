import unittest
import json
import os
import sys
import tempfile

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import app as agenda_app


class TestAgendaApp(unittest.TestCase):
    def setUp(self):
        self.tmpdir = tempfile.mkdtemp()
        db_path = os.path.join(self.tmpdir, "agenda.db")

        self.app = agenda_app.create_app(
            test_config={
                "TESTING": True,
                "SQLALCHEMY_DATABASE_URI": f"sqlite:///{db_path}",
            }
        )

        with self.app.app_context():
            os.makedirs(os.path.dirname(db_path), exist_ok=True)
            agenda_app.db.create_all()

        self.client = self.app.test_client()

    def tearDown(self):
        with self.app.app_context():
            agenda_app.db.engine.dispose()
        try:
            import shutil

            shutil.rmtree(self.tmpdir, ignore_errors=True)
        except Exception:
            pass

    def test_index_page(self):
        response = self.client.get("/")
        self.assertEqual(response.status_code, 200)
        self.assertIn(b"Agenda 2026", response.data)

    def test_get_meses(self):
        response = self.client.get("/api/meses")
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertEqual(len(data), 12)
        meses = [m["mes"] for m in data]
        for m in range(1, 13):
            self.assertIn(f"2026-{m:02d}", meses)

    def test_get_eventos_empty(self):
        response = self.client.get("/api/eventos/2026-01-01")
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertEqual(data, [])

    def test_criar_evento_valido(self):
        response = self.client.post(
            "/api/evento",
            data=json.dumps(
                {
                    "data": "2026-01-15",
                    "hora": "10:00",
                    "titulo": "Reunião",
                    "descricao": "Reunião com o time",
                    "duracao": 2,
                    "cor": "#ff0000",
                }
            ),
            content_type="application/json",
        )
        self.assertEqual(response.status_code, 201)
        data = json.loads(response.data)
        self.assertEqual(data["status"], "sucesso")
        self.assertIn("id", data)

    def test_criar_evento_dados_invalidos(self):
        response = self.client.post(
            "/api/evento",
            data=json.dumps({"data": "data-invalida"}),
            content_type="application/json",
        )
        self.assertEqual(response.status_code, 400)

    def test_criar_evento_sem_titulo(self):
        response = self.client.post(
            "/api/evento",
            data=json.dumps({"data": "2026-01-15", "hora": "10:00"}),
            content_type="application/json",
        )
        self.assertEqual(response.status_code, 400)

    def test_get_eventos_with_data(self):
        self.client.post(
            "/api/evento",
            data=json.dumps(
                {"data": "2026-01-15", "hora": "10:00", "titulo": "Evento Teste"}
            ),
            content_type="application/json",
        )
        response = self.client.get("/api/eventos/2026-01-15")
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertEqual(len(data), 1)
        self.assertEqual(data[0]["titulo"], "Evento Teste")

    def test_atualizar_evento(self):
        create_response = self.client.post(
            "/api/evento",
            data=json.dumps(
                {"data": "2026-01-15", "hora": "10:00", "titulo": "Evento Original"}
            ),
            content_type="application/json",
        )
        evento_id = json.loads(create_response.data)["id"]

        response = self.client.put(
            f"/api/evento/{evento_id}",
            data=json.dumps({"titulo": "Evento Atualizado"}),
            content_type="application/json",
        )
        self.assertEqual(response.status_code, 200)

        get_response = self.client.get("/api/eventos/2026-01-15")
        data = json.loads(get_response.data)
        self.assertEqual(data[0]["titulo"], "Evento Atualizado")

    def test_deletar_evento(self):
        create_response = self.client.post(
            "/api/evento",
            data=json.dumps(
                {"data": "2026-01-15", "hora": "10:00", "titulo": "Evento a Deletar"}
            ),
            content_type="application/json",
        )
        evento_id = json.loads(create_response.data)["id"]

        response = self.client.delete(f"/api/evento/{evento_id}")
        self.assertEqual(response.status_code, 200)

        get_response = self.client.get("/api/eventos/2026-01-15")
        data = json.loads(get_response.data)
        self.assertEqual(len(data), 0)

    def test_rotinas_empty(self):
        response = self.client.get("/api/rotinas")
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertEqual(data, [])

    def test_criar_rotina_valida(self):
        response = self.client.post(
            "/api/rotina",
            data=json.dumps(
                {
                    "titulo": "Academia",
                    "dias_semana": [1, 3, 5],
                    "hora_inicio": "07:00",
                    "data_inicio": "2026-01-01",
                }
            ),
            content_type="application/json",
        )
        self.assertEqual(response.status_code, 201)
        data = json.loads(response.data)
        self.assertEqual(data["status"], "sucesso")

    def test_criar_rotina_sem_titulo(self):
        response = self.client.post(
            "/api/rotina",
            data=json.dumps({"dias_semana": [1]}),
            content_type="application/json",
        )
        self.assertEqual(response.status_code, 400)

    def test_criar_rotina_sem_dias(self):
        response = self.client.post(
            "/api/rotina",
            data=json.dumps({"titulo": "Rotina", "dias_semana": []}),
            content_type="application/json",
        )
        self.assertEqual(response.status_code, 400)

    def test_gerar_eventos_rotina(self):
        create_response = self.client.post(
            "/api/rotina",
            data=json.dumps(
                {
                    "titulo": "Trabalho",
                    "dias_semana": [1, 2, 3, 4, 5],
                    "hora_inicio": "09:00",
                    "data_inicio": "2026-01-01",
                    "data_fim": "2026-01-31",
                }
            ),
            content_type="application/json",
        )
        rotina_id = json.loads(create_response.data)["id"]

        response = self.client.post(
            f"/api/rotina/{rotina_id}/gerar",
            data=json.dumps({}),
            content_type="application/json",
        )
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertIn("eventos_criados", data)

    def test_gerar_eventos_rotina_inexistente(self):
        response = self.client.post(
            "/api/rotina/999/gerar",
            data=json.dumps({}),
            content_type="application/json",
        )
        self.assertEqual(response.status_code, 404)

    def test_deletar_todas_rotinas(self):
        self.client.post(
            "/api/rotina",
            data=json.dumps(
                {
                    "titulo": "Rotina A",
                    "dias_semana": [1],
                    "hora_inicio": "08:00",
                    "data_inicio": "2026-01-01",
                }
            ),
            content_type="application/json",
        )
        self.client.post(
            "/api/rotina",
            data=json.dumps(
                {
                    "titulo": "Rotina B",
                    "dias_semana": [2],
                    "hora_inicio": "09:00",
                    "data_inicio": "2026-01-01",
                }
            ),
            content_type="application/json",
        )
        response = self.client.delete("/api/rotinas")
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertEqual(data["status"], "todas_deletadas")

        rotinas = self.client.get("/api/rotinas")
        self.assertEqual(json.loads(rotinas.data), [])

    def test_criar_rotinas_batch(self):
        response = self.client.post(
            "/api/rotinas/batch",
            data=json.dumps(
                {
                    "rotinas": [
                        {
                            "titulo": "Rotina Batch 1",
                            "dias_semana": [1],
                            "hora_inicio": "07:00",
                            "data_inicio": "2026-01-01",
                        },
                        {
                            "titulo": "Rotina Batch 2",
                            "dias_semana": [3],
                            "hora_inicio": "08:00",
                            "data_inicio": "2026-01-01",
                        },
                    ]
                }
            ),
            content_type="application/json",
        )
        self.assertEqual(response.status_code, 201)
        data = json.loads(response.data)
        self.assertEqual(data["status"], "sucesso")
        self.assertEqual(len(data["ids"]), 2)

        rotinas = self.client.get("/api/rotinas")
        self.assertEqual(len(json.loads(rotinas.data)), 2)


if __name__ == "__main__":
    unittest.main()
