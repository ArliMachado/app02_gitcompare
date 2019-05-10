import React, { Component } from 'react';
import moment from 'moment';
import api from '../../services/api';

import logo from '../../assets/logo.png';
import CompareList from '../../components/CompareList/index';

import { Container, Form } from './styles';

const REPOSITORY_NAME = 'repositories';
export default class Main extends Component {
  state = {
    loading: false,
    repositoryError: false,
    repositoryInput: '',
    repositories: [],
  };

  componentDidMount() {
    this.setState({ repositories: JSON.parse(localStorage.getItem(REPOSITORY_NAME)) || [] });
  }

  handleAddRepository = async (e) => {
    e.preventDefault();
    this.setState({ loading: true });
    try {
      const { data: repository } = await api.get(`/repos/${this.state.repositoryInput}`);
      repository.lastCommit = moment(repository.pushed_at).fromNow();

      this.setState({
        repositoryInput: '',
        repositories: [...this.state.repositories, repository],
        repositoryError: false,
      });

      this.addRepositoryInLocalStorage();
    } catch (err) {
      console.log(err);

      this.setState({ repositoryError: true });
    } finally {
      this.setState({ loading: false });
    }
  };

  handleExcludeRepository = async (id) => {
    const { repositories } = this.state;

    const updatedList = await repositories.filter(repository => repository.id !== id);
    this.setState({ repositories: updatedList });
    this.addRepositoryInLocalStorage();
  };

  handleUpdateRepository = async (id) => {
    const { repositories } = this.state;
    const repository = await repositories.find(rep => rep.id === id);

    try {
      const { data } = await api.get(`/repos/${repository.full_name}`);
      data.lastCommit = moment(data.pushed_at).fromNow();

      this.setState({
        repositoryInput: '',
        repositoryError: false,
        repositories: repositories.map(rep => (rep.id === data.id ? data : rep)),
      });

      this.addRepositoryInLocalStorage();
    } catch (err) {
      console.log(err);
    }
  };

  addRepositoryInLocalStorage = async () => {
    const { repositories } = this.state;
    await localStorage.setItem(REPOSITORY_NAME, JSON.stringify(repositories));
  };

  render() {
    const {
      repositories, repositoryInput, repositoryError, loading,
    } = this.state;
    return (
      <Container>
        <img src={logo} alt="Github Compare" />

        <Form withError={repositoryError} onSubmit={this.handleAddRepository}>
          <input
            type="text"
            placeholder="usuário/repositório"
            value={repositoryInput}
            onChange={e => this.setState({ repositoryInput: e.target.value })}
          />
          <button type="submit">{loading ? <i className="fa fa-spinner fa-pulse" /> : 'OK'}</button>
        </Form>
        <CompareList
          repositories={repositories}
          excludeRepository={this.handleExcludeRepository}
          updateRepository={this.handleUpdateRepository}
        />
      </Container>
    );
  }
}
