import os
import json
import secrets
from datetime import datetime, timedelta, timezone
from typing import Optional, List

from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
from dotenv import load_dotenv
from pydantic import BaseModel, ValidationError, Field

from flask_sqlalchemy import SQLAlchemy

load_dotenv()


class Config:
    SECRET_KEY = os.getenv("SECRET_KEY", secrets.token_hex(32))
    DEBUG = os.getenv("FLASK_DEBUG", "0") == "1"
    SQLALCHEMY_DATABASE_URI = os.getenv(
        "DATABASE_URL",
        f"sqlite:///{os.path.join(os.getcwd(), 'database', 'agenda.db')}",
    )
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    AGENDA_PORT = int(os.getenv("AGENDA_PORT", 5000))
    ALLOWED_ORIGINS = os.getenv(
        "ALLOWED_ORIGINS", "http://localhost:5000,http://localhost:3000"
    ).split(",")


db = SQLAlchemy()


class Evento(db.Model):
    __tablename__ = "eventos"
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    data = db.Column(db.String(10), nullable=False)
    hora = db.Column(db.String(5), nullable=False)
    titulo = db.Column(db.String(200), nullable=False)
    descricao = db.Column(db.Text, default="")
    duracao = db.Column(db.Integer, default=1)
    cor = db.Column(db.String(7), default="#3498db")
    criado_em = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "data": self.data,
            "hora": self.hora,
            "titulo": self.titulo,
            "descricao": self.descricao,
            "duracao": self.duracao,
            "cor": self.cor,
            "criado_em": self.criado_em.isoformat() if self.criado_em else None,
        }


class Rotina(db.Model):
    __tablename__ = "rotinas"
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    titulo = db.Column(db.String(200), nullable=False)
    descricao = db.Column(db.Text, default="")
    cor = db.Column(db.String(7), default="#4285f4")
    dias_semana = db.Column(db.Text, nullable=False)
    hora_inicio = db.Column(db.String(5), nullable=False)
    duracao = db.Column(db.Integer, default=2)
    data_inicio = db.Column(db.String(10), nullable=False)
    data_fim = db.Column(db.String(10), nullable=True)
    ativa = db.Column(db.Integer, default=1)
    criado_em = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "titulo": self.titulo,
            "descricao": self.descricao,
            "cor": self.cor,
            "dias_semana": json.loads(self.dias_semana),
            "hora_inicio": self.hora_inicio,
            "duracao": self.duracao,
            "data_inicio": self.data_inicio,
            "data_fim": self.data_fim,
            "ativa": self.ativa,
            "criado_em": self.criado_em.isoformat() if self.criado_em else None,
        }


class EventoSchema(BaseModel):
    data: str = Field(..., description="Data no formato YYYY-MM-DD")
    hora: str = Field(..., description="Hora no formato HH:MM")
    titulo: str = Field(..., min_length=1, description="Titulo do evento")
    descricao: Optional[str] = Field(default="", description="Descricao do evento")
    duracao: int = Field(default=1, ge=1, description="Duracao em horas")
    cor: Optional[str] = Field(default="#3498db", description="Cor em hexadecimal")


class RotinaSchema(BaseModel):
    titulo: str = Field(..., min_length=1)
    descricao: Optional[str] = Field(default="")
    cor: Optional[str] = Field(default="#4285f4")
    dias_semana: List[int] = Field(
        ..., description="Lista de dias da semana (0=Dom, 6=Sab)"
    )
    hora_inicio: str = Field(..., description="Hora no formato HH:MM")
    duracao: int = Field(default=2, ge=1)
    data_inicio: str = Field(..., description="Data no formato YYYY-MM-DD")
    data_fim: Optional[str] = Field(
        default=None, description="Data no formato YYYY-MM-DD"
    )
    ativa: int = Field(default=1)


class RotinaBatchSchema(BaseModel):
    rotinas: List[RotinaSchema]


def create_app(test_config=None) -> Flask:
    app = Flask(__name__)
    app.config.from_object(Config)

    if test_config:
        app.config.update(test_config)

    db_uri = app.config.get("SQLALCHEMY_DATABASE_URI", "")
    if db_uri.startswith("sqlite:///"):
        db_path = db_uri[len("sqlite:///") :]
        if not os.path.isabs(db_path):
            app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///" + os.path.abspath(
                db_path
            )

    CORS(app, origins=Config.ALLOWED_ORIGINS)
    db.init_app(app)

    @app.before_request
    def ensure_db():
        try:
            os.makedirs("database", exist_ok=True)
            db.create_all()
        except Exception:
            pass

    register_routes(app)
    register_error_handlers(app)

    return app


def init_db():
    with create_app().app_context():
        os.makedirs("database", exist_ok=True)
        db.create_all()


def register_routes(app: Flask):
    @app.get("/")
    def index():
        return render_template("index.html")

    @app.get("/health")
    def health():
        return jsonify({"status": "healthy"}), 200

    @app.get("/api/meses")
    def get_meses():
        try:
            eventos = Evento.query.all()
            rotinas = Rotina.query.filter_by(ativa=1).all()

            datas_com_eventos = {ev.data for ev in eventos}
            datas_com_rotinas = set()

            for rotina in rotinas:
                try:
                    data_inicio = datetime.strptime(rotina.data_inicio, "%Y-%m-%d")
                    data_fim = (
                        datetime.strptime(rotina.data_fim, "%Y-%m-%d")
                        if rotina.data_fim
                        else datetime(2026, 12, 31)
                    )
                except (ValueError, TypeError):
                    continue

                dias_semana = json.loads(rotina.dias_semana)
                atual = data_inicio
                while atual <= data_fim:
                    dow_rotina = (atual.weekday() + 1) % 7
                    if dow_rotina in dias_semana:
                        datas_com_rotinas.add(atual.strftime("%Y-%m-%d"))
                    atual += timedelta(days=1)

            meses = []
            hoje = datetime(2026, 1, 1)
            final = datetime(2026, 12, 31)

            while hoje <= final:
                primeiro_dia = datetime(hoje.year, hoje.month, 1)
                if hoje.month == 12:
                    ultimo_dia = datetime(hoje.year, 12, 31)
                else:
                    ultimo_dia = datetime(hoje.year, hoje.month + 1, 1) - timedelta(
                        days=1
                    )

                dias = []
                num_dias = (ultimo_dia - primeiro_dia).days + 1

                for _ in range((primeiro_dia.weekday() + 1) % 7):
                    dias.append(None)

                for d in range(1, num_dias + 1):
                    data_str = primeiro_dia.replace(day=d).strftime("%Y-%m-%d")
                    dia_info = {
                        "dia": d,
                        "data": data_str,
                        "tem_eventos": data_str in datas_com_eventos,
                    }
                    if data_str in datas_com_rotinas:
                        dia_info["tem_rotinas"] = True
                    dias.append(dia_info)

                meses.append(
                    {
                        "mes": primeiro_dia.strftime("%Y-%m"),
                        "nome_mes": primeiro_dia.strftime("%B"),
                        "ano": hoje.year,
                        "dias": dias,
                    }
                )

                hoje = ultimo_dia + timedelta(days=1)

            return jsonify(meses)
        except Exception as e:
            app.logger.error(f"Erro em /api/meses: {str(e)}")
            return jsonify({"error": "Erro interno do servidor"}), 500

    @app.get("/api/eventos/<data>")
    def get_eventos(data: str):
        try:
            datetime.strptime(data, "%Y-%m-%d")
        except ValueError:
            return jsonify({"error": "Formato de data invalido. Use YYYY-MM-DD"}), 400

        try:
            eventos = Evento.query.filter_by(data=data).order_by(Evento.hora).all()
            return jsonify([ev.to_dict() for ev in eventos])
        except Exception as e:
            app.logger.error(f"Erro em GET /api/eventos/{data}: {str(e)}")
            return jsonify({"error": "Erro interno do servidor"}), 500

    @app.post("/api/evento")
    def criar_evento():
        try:
            payload = EventoSchema(**request.get_json(force=True))
        except ValidationError as e:
            return jsonify({"error": "Dados invalidos", "details": e.errors()}), 400
        except Exception:
            return jsonify({"error": "Corpo da requisicao invalido"}), 400

        try:
            evento = Evento(
                data=payload.data,
                hora=payload.hora,
                titulo=payload.titulo,
                descricao=payload.descricao or "",
                duracao=payload.duracao,
                cor=payload.cor or "#3498db",
            )
            db.session.add(evento)
            db.session.commit()
            return jsonify({"id": evento.id, "status": "sucesso"}), 201
        except Exception as e:
            db.session.rollback()
            app.logger.error(f"Erro em POST /api/evento: {str(e)}")
            return jsonify({"error": "Erro ao criar evento"}), 500

    @app.put("/api/evento/<int:id>")
    def atualizar_evento(id: int):
        evento = Evento.query.get_or_404(id, description="Evento nao encontrado")

        data = request.get_json(force=True) or {}
        if "titulo" not in data or not str(data["titulo"]).strip():
            return jsonify({"error": "Titulo e obrigatorio"}), 400

        try:
            evento.titulo = data.get("titulo", evento.titulo)
            evento.descricao = data.get("descricao", evento.descricao)
            evento.duracao = data.get("duracao", evento.duracao)
            evento.cor = data.get("cor", evento.cor)
            db.session.commit()
            return jsonify({"status": "atualizado"})
        except Exception as e:
            db.session.rollback()
            app.logger.error(f"Erro em PUT /api/evento/{id}: {str(e)}")
            return jsonify({"error": "Erro ao atualizar evento"}), 500

    @app.delete("/api/evento/<int:id>")
    def deletar_evento(id: int):
        evento = Evento.query.get_or_404(id, description="Evento nao encontrado")
        try:
            db.session.delete(evento)
            db.session.commit()
            return jsonify({"status": "deletado"})
        except Exception as e:
            db.session.rollback()
            app.logger.error(f"Erro em DELETE /api/evento/{id}: {str(e)}")
            return jsonify({"error": "Erro ao deletar evento"}), 500

    @app.get("/api/rotinas")
    def get_rotinas():
        try:
            rotinas = Rotina.query.order_by(Rotina.data_inicio).all()
            return jsonify([r.to_dict() for r in rotinas])
        except Exception as e:
            app.logger.error(f"Erro em GET /api/rotinas: {str(e)}")
            return jsonify({"error": "Erro interno do servidor"}), 500

    @app.get("/api/rotinas/<data>")
    def get_rotinas_do_dia(data: str):
        try:
            datetime.strptime(data, "%Y-%m-%d")
        except ValueError:
            return jsonify({"error": "Data invalida"}), 400

        try:
            rotinas = Rotina.query.filter_by(ativa=1).all()
            data_ref = datetime.strptime(data, "%Y-%m-%d")
            dia_semana = (data_ref.weekday() + 1) % 7

            rotinas_do_dia = []
            for rotina in rotinas:
                r = rotina.to_dict()
                if dia_semana not in r["dias_semana"]:
                    continue

                data_inicio = datetime.strptime(r["data_inicio"], "%Y-%m-%d")
                data_fim = (
                    datetime.strptime(r["data_fim"], "%Y-%m-%d")
                    if r["data_fim"]
                    else None
                )

                if data_fim and data_ref > data_fim:
                    continue
                if data_ref < data_inicio:
                    continue

                rotinas_do_dia.append(r)

            return jsonify(rotinas_do_dia)
        except Exception as e:
            app.logger.error(f"Erro em GET /api/rotinas/{data}: {str(e)}")
            return jsonify({"error": "Erro interno do servidor"}), 500

    @app.post("/api/rotina")
    def criar_rotina():
        try:
            payload = RotinaSchema(**request.get_json(force=True))
        except ValidationError as e:
            return jsonify({"error": "Dados invalidos", "details": e.errors()}), 400
        except Exception:
            return jsonify({"error": "Corpo da requisicao invalido"}), 400

        try:
            rotina = Rotina(
                titulo=payload.titulo,
                descricao=payload.descricao or "",
                cor=payload.cor or "#4285f4",
                dias_semana=json.dumps(payload.dias_semana),
                hora_inicio=payload.hora_inicio,
                duracao=payload.duracao,
                data_inicio=payload.data_inicio,
                data_fim=payload.data_fim,
                ativa=payload.ativa,
            )
            db.session.add(rotina)
            db.session.commit()
            return jsonify({"id": rotina.id, "status": "sucesso"}), 201
        except Exception as e:
            db.session.rollback()
            app.logger.error(f"Erro em POST /api/rotina: {str(e)}")
            return jsonify({"error": "Erro ao criar rotina"}), 500

    @app.put("/api/rotina/<int:id>")
    def atualizar_rotina(id: int):
        rotina = Rotina.query.get_or_404(id, description="Rotina nao encontrada")

        data = request.get_json(force=True) or {}
        if "titulo" not in data or not str(data["titulo"]).strip():
            return jsonify({"error": "Titulo e obrigatorio"}), 400

        try:
            rotina.titulo = data.get("titulo", rotina.titulo)
            rotina.descricao = data.get("descricao", rotina.descricao)
            rotina.cor = data.get("cor", rotina.cor)
            rotina.dias_semana = json.dumps(
                data.get("dias_semana", json.loads(rotina.dias_semana))
            )
            rotina.hora_inicio = data.get("hora_inicio", rotina.hora_inicio)
            rotina.duracao = data.get("duracao", rotina.duracao)
            rotina.data_inicio = data.get("data_inicio", rotina.data_inicio)
            rotina.data_fim = data.get("data_fim") or None
            rotina.ativa = data.get("ativa", rotina.ativa)
            db.session.commit()
            return jsonify({"status": "atualizado"})
        except Exception as e:
            db.session.rollback()
            app.logger.error(f"Erro em PUT /api/rotina/{id}: {str(e)}")
            return jsonify({"error": "Erro ao atualizar rotina"}), 500

    @app.delete("/api/rotina/<int:id>")
    def deletar_rotina(id: int):
        rotina = Rotina.query.get_or_404(id, description="Rotina nao encontrada")
        try:
            db.session.delete(rotina)
            db.session.commit()
            return jsonify({"status": "deletado"})
        except Exception as e:
            db.session.rollback()
            app.logger.error(f"Erro em DELETE /api/rotina/{id}: {str(e)}")
            return jsonify({"error": "Erro ao deletar rotina"}), 500

    @app.delete("/api/rotinas")
    def deletar_todas_rotinas():
        try:
            Rotina.query.delete()
            db.session.commit()
            return jsonify({"status": "todas_deletadas"})
        except Exception as e:
            db.session.rollback()
            app.logger.error(f"Erro em DELETE /api/rotinas: {str(e)}")
            return jsonify({"error": "Erro ao deletar rotinas"}), 500

    @app.post("/api/rotinas/batch")
    def criar_rotinas_batch():
        try:
            payload = RotinaBatchSchema(**request.get_json(force=True))
        except ValidationError as e:
            return jsonify({"error": "Dados invalidos", "details": e.errors()}), 400
        except Exception:
            return jsonify({"error": "Corpo da requisicao invalido"}), 400

        try:
            ids_criados = []
            for item in payload.rotinas:
                rotina = Rotina(
                    titulo=item.titulo,
                    descricao=item.descricao or "",
                    cor=item.cor or "#4285f4",
                    dias_semana=json.dumps(item.dias_semana),
                    hora_inicio=item.hora_inicio,
                    duracao=item.duracao,
                    data_inicio=item.data_inicio,
                    data_fim=item.data_fim,
                    ativa=item.ativa,
                )
                db.session.add(rotina)
                ids_criados.append(rotina.id)

            db.session.commit()
            return jsonify({"ids": ids_criados, "status": "sucesso"}), 201
        except Exception as e:
            db.session.rollback()
            app.logger.error(f"Erro em POST /api/rotinas/batch: {str(e)}")
            return jsonify({"error": "Erro ao criar rotinas em lote"}), 500

    @app.post("/api/rotina/<int:id>/gerar")
    def gerar_eventos_rotina(id: int):
        rotina = Rotina.query.get_or_404(id, description="Rotina nao encontrada")

        body = request.get_json(force=True) or {}
        data_inicio = body.get("data_inicio", rotina.data_inicio)
        data_fim = body.get("data_fim", rotina.data_fim) or "2026-12-31"

        try:
            inicio = datetime.strptime(data_inicio, "%Y-%m-%d")
            fim = datetime.strptime(data_fim, "%Y-%m-%d")
        except ValueError:
            return jsonify({"error": "Data invalida"}), 400

        try:
            count = 0
            atual = inicio
            dias_semana = json.loads(rotina.dias_semana)

            while atual <= fim:
                dow_rotina = (atual.weekday() + 1) % 7
                if dow_rotina in dias_semana:
                    data_str = atual.strftime("%Y-%m-%d")
                    existe = Evento.query.filter_by(
                        data=data_str, hora=rotina.hora_inicio, titulo=rotina.titulo
                    ).first()

                    if not existe:
                        evento = Evento(
                            data=data_str,
                            hora=rotina.hora_inicio,
                            titulo=rotina.titulo,
                            descricao=rotina.descricao,
                            duracao=rotina.duracao,
                            cor=rotina.cor,
                        )
                        db.session.add(evento)
                        count += 1

                atual += timedelta(days=1)

            db.session.commit()
            return jsonify({"status": "sucesso", "eventos_criados": count})
        except Exception as e:
            db.session.rollback()
            app.logger.error(f"Erro em POST /api/rotina/{id}/gerar: {str(e)}")
            return jsonify({"error": "Erro ao gerar eventos"}), 500


def register_error_handlers(app: Flask):
    @app.errorhandler(404)
    def not_found(e):
        return jsonify({"error": "Recurso nao encontrado"}), 404

    @app.errorhandler(405)
    def method_not_allowed(e):
        return jsonify({"error": "Metodo nao permitido"}), 405

    @app.errorhandler(500)
    def internal_error(e):
        db.session.rollback()
        return jsonify({"error": "Erro interno do servidor"}), 500


app = create_app()


if __name__ == "__main__":
    port = Config.AGENDA_PORT
    app.run(host="0.0.0.0", port=port, debug=Config.DEBUG)
