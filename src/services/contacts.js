import { ContactsCollection } from '../db/modules/contacts.js';
import { calculatePaginationData } from '../utils/calculatePaginationData.js';
import { SORT_ORDER } from '../constants/constants.js';
import createHttpError from 'http-errors';
export const getAllContacts = async ({
  page,
  perPage,
  sortOrder = SORT_ORDER.ASC,
  sortBy = '_id',
  filter = {},
  contactType = '',
  userId,
}) => {
  const limit = perPage;
  const skip = (page - 1) * perPage;
  const contactsQuery = ContactsCollection.find({ userId });
  if (filter.type !== null) {
    contactsQuery.where('contactType').equals(filter.type);
  }
  if (filter.isFavourite !== null) {
    contactsQuery.where('isFavourite').equals(filter.isFavourite);
  }

  const [contactsCount, contacts] = await Promise.all([
    ContactsCollection.find({ userId }).merge(contactsQuery).countDocuments(),
    contactsQuery
      .skip(skip)
      .limit(limit)
      .sort({ [sortBy]: sortOrder })
      .exec(),
  ]);

  if (!contactsCount) {
    throw createHttpError(404, 'Contacts not found');
  }
  const paginationData = calculatePaginationData(contactsCount, page, perPage);
  return {
    data: contacts,
    ...paginationData,
  };
};
export const getContactById = async (contactId, userId) => {
  ContactsCollection.findOne({ _id: contactId, userId });
};
export const createContact = async (userId, payload) => {
  ContactsCollection.create({ userId, ...payload });
};
export const deleteContact = async (contactId, userId) => {
  ContactsCollection.findByIdAndDelete({
    _id: contactId,
    userId,
  });
};

export const updateContact = async (contactId, userId, payload = {}) => {
  return ContactsCollection.findOneAndUpdate(
    { _id: contactId, userId },
    payload,
    { new: true },
  );
};
