import {Term} from '../term/term';

export class Wod {
  private readonly term: Term;
  private readonly retrievedDate: Date;

  public constructor(term: Term);
  public constructor(wodData: any);
  public constructor(term: Term | any) {
    if (term instanceof Term) {
      this.term = term;
      this.retrievedDate = new Date();
    } else {
      this.term = term.term;
      this.retrievedDate = term.retrievedDate;
    }
  }

  public getTerm(): Term {
    return this.term;
  }

  public getRetrievedDate(): Date {
    return this.retrievedDate;
  }
}
