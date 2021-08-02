import React, { useEffect, useState } from 'react';
import $ from 'jquery';
import AppContainer from '../../components/app/appContainer';
import IconToolTip from '../../components/global/iconTooltip';
import axios from '../../utils/fetchClient';
import Translate from '../../components/utils/translate';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useNotifications } from '../../contexts/NotificationsContext';
import { useTranslation } from 'react-i18next';
import '../../assets/css/groceries.css';

interface article {
  id: number;
  description: string;
  deletedAt: null | string;
}

export default function AppGroceries() {
  const [newArticle, setNewArticle] = useState<string>('');
  const [articles, setArticles] = useState<article[]>([]);
  const { setNotification, setErrorNotification } = useNotifications();
  const { t, i18n } = useTranslation('common');

  function getArticles() {
    axios
      .get(`/groceries/${localStorage.getItem('currentHome')}`)
      .then((res: any) => {
        if (res.data.articles) setArticles(res.data.articles);
        else setErrorNotification(res.data);
      })
      .catch((err) => {
        setNotification(err.response.data);
      });
  }

  useEffect(() => {
    getArticles();
  }, []);

  function forceDeleteArticle(e: any, id: number) {
    axios
      .delete(`/groceries/${localStorage.getItem('currentHome')}/${id}`)
      .then(async (res: any) => {
        const i = articles.findIndex((x) => x.id == id);
        let newArticles = [...articles];
        newArticles.splice(i, 1);
        setArticles(newArticles);
      })
      .catch((err) => {
        setNotification(err.response.data);
      });
  }

  function handleArticle(id: number) {
    toggleArticle(
      id,
      articles.find((x) => x.id == id)?.deletedAt == null ? 'delete' : 'restore'
    );
  }

  function toggleArticle(id: number, action: string) {
    axios
      .put(`/groceries/${localStorage.getItem('currentHome')}/${id}/${action}`)
      .then((res: any) => {
        const i = articles.findIndex((x) => x.id == id);
        let newArticles = [...articles];
        newArticles[i] = res.data.article;
        console.log(res.data.article);
        setArticles(newArticles);
      })
      .catch((err) => {
        setNotification(err.response.data);
      });
  }

  function AddArticle() {
    axios
      .post(`/groceries/${localStorage.getItem('currentHome')}`, {
        description: newArticle,
      })
      .then((res: any) => {
        setArticles(articles.concat([res.data.article]));
        setNewArticle('');
      })
      .catch((err) => {
        setNotification(err.response.data);
      });
  }

  return (
    <AppContainer title="groceries" appName="groceries">
      {articles.length > 0 ? (
        <div className="grocery-list">
          {articles.map((article) => (
            <div key={`a-${article.id}`} className="article">
              {article.deletedAt == null ? (
                <input
                  id={article.id.toString()}
                  type="checkbox"
                  onClick={() => handleArticle(article.id)}
                />
              ) : (
                <input
                  id={article.id.toString()}
                  type="checkbox"
                  defaultChecked
                  onClick={() => handleArticle(article.id)}
                />
              )}
              <label
                htmlFor={article.id.toString()}
                onClick={() => handleArticle(article.id)}
              >
                {article.description}
              </label>
              <IconToolTip
                icon="trash"
                className="icon"
                circled={{ value: true, multiplier: 0.5 }}
                style={{ iconWidth: 29, tooltipMultiplier: 5 }}
                onClick={(e: any) => forceDeleteArticle(e, article.id)}
              />
            </div>
          ))}
        </div>
      ) : (
        <h2>
          <Translate name="groceries.empty" />
        </h2>
      )}
      <div
        className="article-new"
        onClick={() => $('.article-input').trigger('click')}
      >
        <FontAwesomeIcon
          icon="plus-circle"
          className="icon"
          onClick={AddArticle}
        />
        <input
          placeholder={t('groceries.new')}
          type="text"
          value={newArticle}
          onChange={(e: any) => setNewArticle(e.target.value)}
          onKeyUp={(e: any) => {
            if (e.key === 'Enter') AddArticle();
          }}
          className="article-input"
        ></input>
      </div>
    </AppContainer>
  );
}
